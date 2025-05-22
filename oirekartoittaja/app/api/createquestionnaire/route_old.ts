import { NextRequest, NextResponse } from 'next/server';
import { generateMedicalQuestionnaire } from '@/app/lib/generateMedicalQuestionnaire';

// Utility function to sanitize text preserving Nordic characters
const sanitizeText = (input: string): string => {
  // Allow letters (including Nordic ä, ö, å, Ä, Ö, Å), numbers, whitespace, and basic punctuation
  return input.replace(/[^\w\s.,!?äöåÄÖÅ-]/g, '').trim();
};

export async function POST(req: NextRequest) {
  try {
    const { text, isGeneral } = await req.json();

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required.' }, { status: 400 });
    }

    const sanitizedText = sanitizeText(text);

    // Validate text length
    if (sanitizedText.length < 3 || sanitizedText.length > 100) {
      return NextResponse.json(
        { error: 'Text length must be between 3 and 100 characters.' },
        { status: 400 }
      );
    }
    let typeOfQuestionnaire : 'overallHealth' | 'symptomFocused' = isGeneral ? 'overallHealth' : 'symptomFocused';
    let questionObject = await generateMedicalQuestionnaire({topic: sanitizedText, type: typeOfQuestionnaire})
    console.log(questionObject);

    return NextResponse.json({ message: 'Text processed successfully.', sanitizedText }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}
