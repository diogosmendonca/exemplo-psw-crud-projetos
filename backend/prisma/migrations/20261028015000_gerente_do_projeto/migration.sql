-- AlterTable
ALTER TABLE "projetos" ADD COLUMN "gerente_id" INTEGER;

-- CreateIndex
CREATE INDEX "projetos_gerente_id_idx" ON "projetos"("gerente_id");

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_gerente_id_fkey" FOREIGN KEY ("gerente_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
