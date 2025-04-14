import { 
  listarEmprestimos, 
  listarHistoricoEmprestimos, 
  confirmarDevolucao 
} from '../../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo') || 'ativos';

  try {
    let data;
    if (tipo === 'ativos') {
      data = await listarEmprestimos();
    } else if (tipo === 'historico') {
      data = await listarHistoricoEmprestimos();
    } else {
      return Response.json(
        { error: "Tipo de consulta inválido" },
        { status: 400 }
      );
    }
    
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: "Erro ao buscar empréstimos" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json(
        { error: "ID do empréstimo é obrigatório" },
        { status: 400 }
      );
    }

    const emprestimoAtualizado = await confirmarDevolucao(id);
    return Response.json(emprestimoAtualizado);
  } catch (error) {
    return Response.json(
      { error: "Erro ao confirmar devolução" },
      { status: 500 }
    );
  }
}