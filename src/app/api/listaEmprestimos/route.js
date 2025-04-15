//src/app/api/listaEmprestimos/route.js
import { listarEmprestimos, listarHistoricoEmprestimos, confirmarDevolucao, getEmprestimoPorId } from '../../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    
    let data;
    if (tipo === 'ativos') {
      data = await listarEmprestimos();
    } else if (tipo === 'historico') {
      data = await listarHistoricoEmprestimos();
    } else {
      return Response.json({ error: "Tipo inválido" }, { status: 400 });
    }
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return Response.json({ error: "ID do empréstimo não fornecido" }, { status: 400 });
    }

    const emprestimoAtualizado = await confirmarDevolucao(data.id);
    return Response.json(emprestimoAtualizado);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    console.log("Iniciando DELETE - Corpo da requisição:", await request.clone().text());
    
    const data = await request.json();
    console.log("ID recebido para deletar:", data.id);

    if (!data.id) {
      console.error("ID não fornecido");
      return Response.json({ error: "ID do empréstimo não fornecido" }, { status: 400 });
    }

    const emprestimo = await getEmprestimoPorId(data.id);
    console.log("Empréstimo encontrado:", emprestimo);

    if (!emprestimo) {
      console.error("Empréstimo não encontrado para ID:", data.id);
      return Response.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    if (emprestimo.devolvido) {
      console.error("Tentativa de deletar empréstimo já devolvido");
      return Response.json({ 
        error: "Não é possível excluir empréstimos já devolvidos",
        code: "EMPRESTIMO_JA_DEVOLVIDO"
      }, { status: 400 });
    }

    console.log("Chamando deletarEmprestimo para ID:", data.id);
    await deletarEmprestimo(data.id);
    console.log("Empréstimo deletado com sucesso");

    return Response.json({ 
      success: true, 
      message: "Empréstimo deletado com sucesso",
      deletedId: data.id
    });

  } catch (error) {
    console.error("Erro completo ao deletar empréstimo:", {
      message: error.message,
      stack: error.stack,
      rawError: error
    });
    return Response.json({ 
      error: "Erro ao deletar empréstimo",
      details: error.message,
      code: "ERRO_INTERNO"
    }, { status: 500 });
  }
}