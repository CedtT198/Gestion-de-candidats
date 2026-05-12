import { z } from "zod";

export const candidateSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères"),

  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères"),

  email: z
    .string()
    .email("Adresse email invalide"),

  phone: z
    .string()
    .min(10, "Numéro de téléphone invalide")
});

export const partialCandidateSchema = candidateSchema.partial();