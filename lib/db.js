const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 1. FUNÇÕES PARA A PÁGINA HOME (LISTAGEM E BUSCA)
async function getLivros() {
  return await prisma.livro.findMany({
    orderBy: {
      titulo: 'asc'
    }
  })
}

async function buscarLivrosPorTitulo(titulo) {
  return await prisma.livro.findMany({
    where: {
      titulo: {
        contains: titulo,
        mode: 'insensitive'
      }
    },
    orderBy: {
      titulo: 'asc'
    }
  })
}

async function getEstatisticas() {
  const [totalLivros, emprestimosAtivos] = await Promise.all([
    prisma.livro.count(),
    prisma.emprestimo.count({
      where: { devolvido: false }
    })
  ])
  
  return {
    total: totalLivros,
    disponiveis: totalLivros - emprestimosAtivos,
    emprestados: emprestimosAtivos
  }
}

// 2. FUNÇÕES PARA A PÁGINA DE REGISTRAR EMPRÉSTIMO
async function buscarLivroPorTombo(numeroTombo) {
  return await prisma.livro.findUnique({
    where: { numeroTombo: String(numeroTombo) }
  })
}

async function verificarDisponibilidade(livroId) {
  const emprestimoAtivo = await prisma.emprestimo.findFirst({
    where: {
      livroId: livroId,
      devolvido: false
    }
  })
  return !emprestimoAtivo
}

async function registrarEmprestimo(data) {
  return await prisma.emprestimo.create({
    data: {
      livroId: data.livroId,
      quantidade: data.quantidade,
      tipoPessoa: data.tipoPessoa,
      nomePessoa: data.nomePessoa,
      serie: data.serie,
      turma: data.turma,
      dataEmprestimo: new Date(),
      dataDevolucao: new Date(data.dataDevolucao),
      devolvido: false
    },
    include: {
      livro: true
    }
  })
}

// 3. FUNÇÕES PARA A PÁGINA DE EMPRÉSTIMOS ATIVOS
async function listarEmprestimos() {
  return await prisma.emprestimo.findMany({
    where: {
      devolvido: false
    },
    include: {
      livro: true
    },
    orderBy: {
      dataDevolucao: 'asc'
    }
  })
}

async function listarHistoricoEmprestimos() {
  return await prisma.emprestimo.findMany({
    where: {
      devolvido: true
    },
    include: {
      livro: true
    },
    orderBy: {
      dataDevolucao: 'desc'
    },
    take: 50
  })
}

async function confirmarDevolucao(id) {
  return await prisma.emprestimo.update({
    where: { id: parseInt(id) },
    data: { 
      devolvido: true,
      dataDevolucaoEfetiva: new Date() 
    }
  })
}

async function getEmprestimoPorId(id) {
  return await prisma.emprestimo.findUnique({
    where: { id: parseInt(id) },
    include: {
      livro: true
    }
  })
}

// Exporta todas as funções
module.exports = {
  prisma,
  
  // Para página Home
  getLivros,
  buscarLivrosPorTitulo,
  getEstatisticas,
  
  // Para página Registrar Empréstimo
  buscarLivroPorTombo,
  verificarDisponibilidade,
  registrarEmprestimo,
  
  // Para página Empréstimos Ativos
  listarEmprestimos,
  listarHistoricoEmprestimos,
  confirmarDevolucao,
  getEmprestimoPorId
  
}