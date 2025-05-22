import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const basePath = path.join(process.cwd(), 'questionnaires');
  const folders = ['general', 'symptom'];

  const questionnaires = await Promise.all(
    folders.map(async (folder) => {
      const folderPath = path.join(basePath, folder);
      const files = await fs.readdir(folderPath);
      return {
        folder,
        files,
      };
    })
  );

  return NextResponse.json(questionnaires);
}
