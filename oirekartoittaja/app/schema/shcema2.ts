import { z } from 'zod';

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
