import { ZodType, z } from 'zod';

export class FaqValidation {
  static readonly CREATE: ZodType = z.object({
    question: z.string().min(1).max(255),
    answer: z.string().min(1).max(255),
    type: z.number(),
  });
}
