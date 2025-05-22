import { z } from 'zod';

export const medicalQuestionnaireSchema = z.object({
  questionnaireType: z.enum(['overallHealth', 'symptomFocused']),
  topic: z.string(),
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answers: z.array(
        z.object({
          text: z.string(),
          followUpQuestionIds: z.array(z.string()).optional(), // Optional follow-up if needed
        })
      ),
    })
  ),
});
