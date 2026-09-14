import { NextRequest, NextResponse } from 'next/server';
import { analyzeReceiptImage } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Data gambar wajib diunggah' }, { status: 400 });
    }

    const scanResult = await analyzeReceiptImage(imageBase64, mimeType || 'image/jpeg');
    return NextResponse.json({ success: true, data: scanResult });
  } catch (error: any) {
    console.error('API Scan Receipt error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses gambar bukti transaksi' },
      { status: 500 }
    );
  }
}
