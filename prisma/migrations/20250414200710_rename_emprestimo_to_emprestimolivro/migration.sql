/*
  Warnings:

  - You are about to drop the `emprestimos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "emprestimos" DROP CONSTRAINT "emprestimos_livroId_fkey";

-- DropTable
DROP TABLE "emprestimos";

-- CreateTable
CREATE TABLE "emprestimos_livros" (
    "id" SERIAL NOT NULL,
    "livroId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "tipoPessoa" VARCHAR(20) NOT NULL,
    "nomePessoa" VARCHAR(100) NOT NULL,
    "serie" VARCHAR(50),
    "turma" VARCHAR(10),
    "dataEmprestimo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" TIMESTAMP(3) NOT NULL,
    "devolvido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "emprestimos_livros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emprestimos_livros_livroId_idx" ON "emprestimos_livros"("livroId");

-- AddForeignKey
ALTER TABLE "emprestimos_livros" ADD CONSTRAINT "emprestimos_livros_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
