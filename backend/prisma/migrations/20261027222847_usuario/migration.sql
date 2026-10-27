-- CreateEnum
CREATE TYPE "perfil_usuario" AS ENUM ('administrador', 'gerente');

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "nome_usuario" VARCHAR(50) NOT NULL,
    "nome_usuario_chave" VARCHAR(50) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "perfil_usuario" NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_nome_usuario_chave_key" ON "usuario"("nome_usuario_chave");
