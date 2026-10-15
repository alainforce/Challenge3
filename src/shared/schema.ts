import { z } from 'zod';
import { CATEGORIES } from './types';
export const clauseSchema = z.object({ category: z.enum(CATEGORIES), severity: z.number().int().min(1).max(5), explanation: z.string().min(1), quote: z.string().min(1) }).strict();
export const responseSchema = z.object({ isLegalDocument: z.boolean(), confidence: z.number().min(0).max(1), uncertainty: z.string(), clauses: z.array(clauseSchema) }).strip();
export type ResponseInput = z.infer<typeof responseSchema>;
export const jsonSchema = { type:'object', required:['isLegalDocument','confidence','uncertainty','clauses'], properties:{ isLegalDocument:{type:'boolean'}, confidence:{type:'number'}, uncertainty:{type:'string'}, clauses:{type:'array',items:{type:'object',required:['category','severity','explanation','quote'],properties:{category:{type:'string',enum:[...CATEGORIES]},severity:{type:'integer'},explanation:{type:'string'},quote:{type:'string'}}}} } } as const;
