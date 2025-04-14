// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const livros = require('./livros.json');

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });

  try {
    console.log(`Importando ${livros.length} livros...`);
    
    for (const livro of livros) {
      await prisma.livro.upsert({
        where: { numeroTombo: livro.numeroTombo },
        update: {},
        create: {
          numeroTombo: livro.numeroTombo,
          titulo: livro.titulo,
          autor: livro.autor,
          editora: livro.editora || null,
          genero: livro.genero || null
        }
      });
      console.log(`✔ ${livro.titulo}`);
    }
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();