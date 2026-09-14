import { NextRequest, NextResponse } from 'next/server';
import { analyzePortfolioImage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Data gambar portofolio wajib diunggah' }, { status: 400 });
    }

    const scanResult = await analyzePortfolioImage(imageBase64, mimeType || 'image/jpeg');
    return NextResponse.json({ success: true, data: scanResult });
  } catch (error: any) {
    console.error('API Scan Portfolio error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses gambar portofolio Bibit' },
      { status: 500 }
    );
  }
}
