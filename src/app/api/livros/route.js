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
  const status = searchParams.get("status");
  const ordenacao = searchParams.get("ordenacao");
  const dataFiltro = searchParams.get("data");

  try {
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

    const estatisticas = await getEstatisticas();
    let livros = termo
      ? await buscarLivrosPorTitulo(termo)
      : await getLivros();
    const emprestimosAtivos = await listarEmprestimos();

    let livrosFormatados = livros.map((livro) => {
      const emprestimo = emprestimosAtivos.find((e) => e.livroId === livro.id);
      return {
        ...livro,
        status: emprestimo ? "Emprestado" : "Disponível",
        destinatario: emprestimo ? emprestimo.nomePessoa : null,
        dataEmprestimo: emprestimo ? emprestimo.dataEmprestimo : null,
      };
    });

    // Aplicar Filtros
    if (status && status !== 'todos') {
      livrosFormatados = livrosFormatados.filter(livro => 
        status === 'disponivel' ? livro.status === 'Disponível' : livro.status === 'Emprestado'
      );
    }

    if (dataFiltro) {
      livrosFormatados = livrosFormatados.filter(livro => 
        livro.dataEmprestimo && livro.dataEmprestimo.startsWith(dataFiltro)
      );
    }

    // Aplicar Ordenação
    switch (ordenacao) {
      case 'autor':
        livrosFormatados.sort((a, b) => a.autor.localeCompare(b.autor));
        break;
      case 'tombo':
        livrosFormatados.sort((a, b) => a.numeroTombo.localeCompare(b.numeroTombo));
        break;
      case 'data':
        livrosFormatados.sort((a, b) => 
          new Date(b.dataEmprestimo) - new Date(a.dataEmprestimo)
        );
        break;
      default:
        livrosFormatados.sort((a, b) => a.titulo.localeCompare(b.titulo));
    }

    return Response.json({
      estatisticas,
      livros: livrosFormatados,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}