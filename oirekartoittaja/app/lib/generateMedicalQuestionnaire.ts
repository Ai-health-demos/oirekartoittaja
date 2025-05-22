import { generateObject } from 'ai';
import { openai } from "@ai-sdk/openai";
import { medicalQuestionnaireSchema } from '@/app/schema/schema';
import { medicalQuestionnaireSchemaNew } from '../schema/shcema2';

export interface GenerateMedicalQuestionnaireParams {
  topic: string;
  type: 'overallHealth' | 'symptomFocused';
}

export async function generateMedicalQuestionnaire({
  topic,
  type,
}: GenerateMedicalQuestionnaireParams) {
  const prompt = `
Suunnittele suomenkielinen lääkärikysely aiheen "${topic}" perusteella. 
Kyselyn tarkoitus on ${type === 'overallHealth' 
    ? 'selvittää potilaan yleinen ja erityinen terveydentila.'
    : 'selvittää potilaan oireiden juurisyy aiheessa "' + topic + '".'}
  
Tee klikkailtava lomake, jossa:
- Kysymyksiin voi vastata valitsemalla vaihtoehdon.
- Kysymykset ja vastaukset ovat lyhyitä ja ymmärrettäviä.
- Älä kirjoita muuta kuin kysymyksiä ja vastauksia.
`;

  const { object } = await generateObject({
    model: openai('gpt-4.1'),
    schema: medicalQuestionnaireSchemaNew,
    prompt,
  });

  return object;
}