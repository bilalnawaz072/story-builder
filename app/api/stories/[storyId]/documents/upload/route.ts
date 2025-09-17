import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
      // KEY FIX: Automatically add a random suffix to prevent filename conflicts
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);

  } catch (error: any) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json(
      { message: `Error uploading file: ${error.message || 'Unknown error.'}` }, 
      { status: 500 }
    );
  }
}