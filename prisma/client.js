const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Conexão global para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

module.exports = prisma