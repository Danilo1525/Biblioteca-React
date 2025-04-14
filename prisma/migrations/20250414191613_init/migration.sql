-- CreateEnum
CREATE TYPE "TipoPessoa" AS ENUM ('ALUNO', 'PROFESSOR');

-- CreateTable
CREATE TABLE "livros" (
    "id" SERIAL NOT NULL,
    "numeroTombo" VARCHAR(20) NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "autor" VARCHAR(100) NOT NULL,
    "editora" VARCHAR(100),
    "genero" VARCHAR(50),

    CONSTRAINT "livros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprestimos" (
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

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "livros_numeroTombo_key" ON "livros"("numeroTombo");

-- CreateIndex
CREATE INDEX "livros_numeroTombo_titulo_autor_genero_idx" ON "livros"("numeroTombo", "titulo", "autor", "genero");

-- CreateIndex
CREATE INDEX "emprestimos_livroId_idx" ON "emprestimos"("livroId");

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
