'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Sparkles, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { analyzeReceiptImage } from '@/lib/gemini';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
}

export const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleStartScan = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      // Call Gemini Vision API via route handler or direct helper
      const base64Data = selectedImage.split(',')[1];
      const parsedData = await analyzeReceiptImage(base64Data, mimeType);
      
      setIsAnalyzing(false);
      onScanSuccess(parsedData);
      onClose();
    } catch (err: any) {
      console.error('Scan failed:', err);
      setIsAnalyzing(false);
      setErrorMessage('Gagal memproses gambar. Pastikan gambar jelas dan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in transition-colors duration-300">
      <div className="glass-panel rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">AI Universal Receipt Reader</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Scan Struk Fisik, Shopee, GoPay, BCA Mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Area: Split Camera vs Gallery Options */}
        <div className="mb-4">
          {!selectedImage ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Option 1: Kamera Smartphone */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 flex items-center justify-center transition-all mb-2 shadow-md">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white mb-0.5">Ambil Kamera</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Foto Langsung HP</span>
                </button>

                {/* Option 2: Galeri Smartphone */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 flex items-center justify-center transition-all mb-2 shadow-md">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white mb-0.5">Pilih Galeri</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Album & File HP</span>
                </button>
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 max-h-64 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Bukti Keuangan"
                className="object-contain max-h-64 w-full"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-rose-500 transition-colors"
                title="Ganti Gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick format tags hint */}
        <div className="mb-5 flex flex-wrap gap-1.5 text-[10px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">✓ Struk Fisik</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">✓ Shopee/Tokopedia</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">✓ GoPay/QRIS</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">✓ BCA/Livin</span>
        </div>

        {errorMessage && (
          <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Scan action */}
        <button
          onClick={handleStartScan}
          disabled={!selectedImage || isAnalyzing}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses dengan Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Mulai AI Scan Transaksi</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
