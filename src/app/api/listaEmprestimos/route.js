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
    const data = await request.json();
    
    if (!data.id) {
      return Response.json({ error: "ID do empréstimo não fornecido" }, { status: 400 });
    }

    // Verifica se o empréstimo existe
    const emprestimo = await getEmprestimoPorId(data.id);
    if (!emprestimo) {
      return Response.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    // Verifica se o empréstimo já foi devolvido
    if (emprestimo.devolvido) {
      return Response.json({ 
        error: "Não é possível excluir empréstimos já devolvidos",
        code: "EMPRESTIMO_JA_DEVOLVIDO"
      }, { status: 400 });
    }

    // Deleta o empréstimo
    await deletarEmprestimo(data.id);
    
    return Response.json({ 
      success: true, 
      message: "Empréstimo deletado com sucesso",
      deletedId: data.id  // Envia o ID deletado para referência no frontend
    });
  } catch (error) {
    console.error("Erro ao deletar empréstimo:", error);
    return Response.json({ 
      error: "Erro ao deletar empréstimo",
      details: error.message,
      code: "ERRO_INTERNO"
    }, { status: 500 });
  }
}