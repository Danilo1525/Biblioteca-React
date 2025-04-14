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

    // Aqui você precisaria adicionar a função para deletar o empréstimo no seu lib/db.js
    // Por exemplo: await deletarEmprestimo(data.id);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}