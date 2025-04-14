import {
  getEstatisticas,
  buscarLivrosPorTitulo,
  getLivros,
  listarEmprestimos,
  buscarLivroPorTombo,
} from "../../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const termo = searchParams.get("termo");
  const tombo = searchParams.get("tombo");

  try {
    // Busca por tombo específico
    if (tombo) {
      const livro = await buscarLivroPorTombo(tombo);
      if (!livro) {
        return Response.json(
          { error: "Livro não encontrado" },
          { status: 404 }
        );
      }

      const emprestimosAtivos = await listarEmprestimos();
      const emprestado = emprestimosAtivos.some((e) => e.livroId === livro.id);

      return Response.json({
        ...livro,
        status: emprestado ? "Emprestado" : "Disponível",
        destinatario: emprestado
          ? emprestimosAtivos.find((e) => e.livroId === livro.id).nomePessoa
          : null,
      });
    }

    // Busca geral
    const estatisticas = await getEstatisticas();
    const livros = termo
      ? await buscarLivrosPorTitulo(termo)
      : await getLivros();
    const emprestimosAtivos = await listarEmprestimos();

    // Formata livros locais
    const livrosFormatados = livros.map((livro) => {
      const emprestimo = emprestimosAtivos.find((e) => e.livroId === livro.id);
      return {
        ...livro,
        status: emprestimo ? "Emprestado" : "Disponível",
        destinatario: emprestimo ? emprestimo.nomePessoa : null,
        origem: "local",
      };
    });

    // Busca na API externa se houver termo
    let livrosExternos = [];
    if (termo) {
      const apiResponse = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          termo
        )}&limit=5`
      );
      const dadosExternos = await apiResponse.json();

      livrosExternos = dadosExternos.docs.map((livro) => ({
        titulo: livro.title,
        autor: livro.author_name?.join(", ") || "Autor desconhecido",
        capa: livro.cover_i
          ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-M.jpg`
          : null,
        ano: livro.first_publish_year,
        status: "Consulta externa",
        origem: "externo",
      }));
    }

    return Response.json({
      estatisticas,
      livros: [...livrosFormatados, ...livrosExternos],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
