import { z } from 'zod';

const questionSchema: z.ZodSchema = z.object({
  id: z.string(),
  question: z.string(),
  answers: z.array(
    z.object({
      text: z.string(),
      followUpQuestions: z.array(z.lazy(() => questionSchema)).optional(),
    })
  ),
});

export const medicalQuestionnaireSchemaNew = z.object({
  questionnaireType: z.enum(['overallHealth', 'symptomFocused']),
  topic: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answers: z.array(
        z.object({
          text: z.string(),
          followUpQuestions: z.array(z.lazy(() => questionSchema)).optional(),
        })
      ),
    })
  ),
});

// Export TypeScript type from schema
export type MedicalQuestionnaire = z.infer<typeof medicalQuestionnaireSchemaNew>;
