import { z } from "zod";

export const createPackageSchema = z.object({
  recipient_apartment_id: z
    .string()
    .uuid({ message: "Selecione um apartamento válido." }),
  storage_deadline_days: z.coerce
    .number({ message: "Informe um número válido." })
    .int({ message: "Informe um número inteiro." })
    .min(1, { message: "Prazo mínimo é 1 dia." })
    .max(30, { message: "Prazo máximo é 30 dias." }),
  description: z
    .string()
    .max(500, { message: "Descrição deve ter no máximo 500 caracteres." })
    .optional(),
});

export type CreatePackageFormData = z.infer<typeof createPackageSchema>;
