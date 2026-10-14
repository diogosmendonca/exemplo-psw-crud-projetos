-- CreateEnum
CREATE TYPE "status_projeto" AS ENUM ('ativo', 'inativo');

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "nome_chave" VARCHAR(100) NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "status_projeto" NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "tecnologias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "url" TEXT NOT NULL DEFAULT '',
    "cliente_id" INTEGER,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_nome_chave_key" ON "cliente"("nome_chave");

-- CreateIndex
CREATE INDEX "projetos_cliente_id_idx" ON "projetos"("cliente_id");

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
