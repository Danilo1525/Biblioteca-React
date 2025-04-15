import { verificarDisponibilidade, registrarEmprestimo } from '../../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (!data.livroId || !data.quantidade || !data.tipoPessoa || !data.dataDevolucao) {
      return Response.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Verifica disponibilidade
    const disponivel = await verificarDisponibilidade(data.livroId);
    if (!disponivel) {
      return Response.json({ error: "Livro já está emprestado" }, { status: 400 });
    }

    // Registra empréstimo
    const novoEmprestimo = await registrarEmprestimo({
      ...data,
      dataDevolucao: new Date(data.dataDevolucao)
    });
    
    return Response.json(novoEmprestimo);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
export async function DELETE(request, { params }) {
  const { id } = params; // ID do empréstimo a ser deletado

  try {
    // Conexão com o Neon DB (exemplo com Prisma)
    await prisma.emprestimo.delete({
      where: { id: parseInt(id) }, // Certifique-se de converter para número se necessário
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao deletar empréstimo:", error);
    return new Response(JSON.stringify({ error: "Falha ao deletar" }), {
      status: 500,
    });
  }
}
}