import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { filename: string, folder: string } }) {
  const { filename, folder } = await params;
//   console.log("file: ", filename);
  const basePath = path.join(process.cwd(), `questionnaires/${folder}`);
  const filePath = path.join(basePath, decodeURIComponent(filename));
//   console.log("filepath: ", filePath);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.log("ile not found");
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { filename: string, folder: string } }) {
  const { filename, folder } = await params;
  const data = await req.json();
  const basePath = path.join(process.cwd(), `questionnaires/${folder}`);
  const filePath = path.join(basePath, decodeURIComponent(filename));

  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Saved successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Error saving file.' }, { status: 500 });
  }
}
