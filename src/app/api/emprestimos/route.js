import { verificarDisponibilidade, registrarEmprestimo } from '../../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validações básicas
    if (!data.livroId || !data.quantidade || !data.tipoPessoa || !data.dataDevolucao) {
      return Response.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Validação da data de devolução
    const dataDevolucao = new Date(data.dataDevolucao);
    const hoje = new Date();
    
    // Remove horas/minutos/segundos para comparar apenas a data
    hoje.setHours(0, 0, 0, 0);
    dataDevolucao.setHours(0, 0, 0, 0);
    
    if (dataDevolucao < hoje) {
      return Response.json({ 
        error: "Data de devolução não pode ser anterior à data atual" 
      }, { status: 400 });
    }

    // Verifica disponibilidade
    const disponivel = await verificarDisponibilidade(data.livroId);
    if (!disponivel) {
      return Response.json({ error: "Livro já está emprestado" }, { status: 400 });
    }

    // Registra empréstimo
    const novoEmprestimo = await registrarEmprestimo({
      ...data,
      dataDevolucao: dataDevolucao // Usa o objeto Date já validado
    });
    
    return Response.json(novoEmprestimo);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}