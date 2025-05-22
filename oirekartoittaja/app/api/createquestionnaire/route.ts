import { NextRequest, NextResponse } from 'next/server';
import { generateMedicalQuestionnaire } from '@/app/lib/generateMedicalQuestionnaire';
import { medicalQuestionnaireSchema } from '@/app/schema/schema';
import { medicalQuestionnaireSchemaNew } from '@/app/schema/shcema2';
import path from 'path';
import fs from 'fs/promises';

// Sanitize input preserving Nordic characters
const sanitizeText = (input: string): string => {
  return input.replace(/[^\w\s.,!?äöåÄÖÅ-]/g, '').trim();
};

export async function POST(req: NextRequest) {
  try {
    const { text, isGeneral } = await req.json();

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required.' }, { status: 400 });
    }

    const sanitizedText = sanitizeText(text);

    if (sanitizedText.length < 3 || sanitizedText.length > 100) {
      return NextResponse.json(
        { error: 'Text length must be between 3 and 100 characters.' },
        { status: 400 }
      );
    }

    const typeOfQuestionnaire = isGeneral ? 'overallHealth' : 'symptomFocused';
    const questionObject = await generateMedicalQuestionnaire({
      topic: sanitizedText,
      type: typeOfQuestionnaire,
    });

    const parsed = medicalQuestionnaireSchemaNew.safeParse(questionObject);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Generated object failed validation.' }, { status: 400 });
    }

    const folderPath = path.join(
      process.cwd(),
      'questionnaires',
      typeOfQuestionnaire === 'overallHealth' ? 'general' : 'symptom'
    );

    await fs.mkdir(folderPath, { recursive: true });

    const filePath = path.join(folderPath, `${sanitizedText}-${Date.now()}.json`);

    await fs.writeFile(filePath, JSON.stringify(parsed.data, null, 2), 'utf-8');

    return NextResponse.json({
      message: 'Questionnaire saved successfully.',
      filePath,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
