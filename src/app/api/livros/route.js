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
      };
    });

    return Response.json({
      estatisticas,
      livros: livrosFormatados,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}