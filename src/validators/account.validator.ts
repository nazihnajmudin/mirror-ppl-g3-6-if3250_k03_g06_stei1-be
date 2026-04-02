import { Role } from '@prisma/client';
import { z } from 'zod';

// Kaprodi and Tim Prodi must be associated with a study program
const requiresProdiRole = (role: Role): boolean => {
  return role === Role.TIM_PRODI || role === Role.KAPRODI;
};

export const createAccountSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
    email: z.string().email('Format email tidak valid'),
    role: z.nativeEnum(Role),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    prodiId: z.union([
      z.string().min(1, 'ProdiId tidak boleh kosong'),
      z.null(),
    ]).optional(),
  })
  .refine(
    (data) => {
      // If the role requires a prodi (Kaprodi or Tim Prodi), prodiId must be provided
      if (requiresProdiRole(data.role) && !data.prodiId) {
        return false;
      }
      return true;
    },
    { message: 'ProdiId wajib diisi untuk role ini', path: ['prodiId'] }
  );

export const updateAccountSchema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter').max(100).optional(),
    role: z.nativeEnum(Role).optional(),
    prodiId: z.union([
      z.string().min(1, 'ProdiId tidak boleh kosong'),
      z.null(),
    ]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.role && requiresProdiRole(data.role) && !data.prodiId) {
        return false;
      }
      return true;
    },
    { message: 'ProdiId wajib diisi untuk role ini', path: ['prodiId'] }
  );

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
