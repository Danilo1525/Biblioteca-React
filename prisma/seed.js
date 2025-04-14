// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const livrosData = require('./livros.json');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando arquivo livros.json...');
  
  // Validação do arquivo
  if (!fs.existsSync('./prisma/livros.json')) {
    throw new Error('Arquivo livros.json não encontrado!');
  }

  console.log(`📚 Iniciando importação de ${livrosData.length} livros...`);

  try {
    // Usando transaction para melhor performance
    const result = await prisma.$transaction(
      livrosData.map(livro => 
        prisma.livro.upsert({
          where: { numeroTombo: String(livro.numeroTombo) },
          update: {},
          create: {
            numeroTombo: String(livro.numeroTombo),
            titulo: livro.titulo,
            autor: livro.autor,
            editora: livro.editora || null,
            genero: livro.genero || null
          }
        })
      )
    );
    
    console.log(`✅ ${result.length} livros importados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });