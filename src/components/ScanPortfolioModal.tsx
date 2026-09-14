'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, TrendingUp, Sparkles, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { analyzePortfolioImage } from '@/lib/gemini';

interface ScanPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (stocksData: Array<{ ticker: string; lots: number; avgBuyPrice?: number }>) => void;
}

export const ScanPortfolioModal: React.FC<ScanPortfolioModalProps> = ({
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
      const base64Data = selectedImage.split(',')[1];
      const parsed = await analyzePortfolioImage(base64Data, mimeType);
      
      setIsAnalyzing(false);

      if (parsed && Array.isArray(parsed.stocks)) {
        onScanSuccess(parsed.stocks);
        onClose();
      } else {
        setErrorMessage('Format screenshot portofolio tidak terdeteksi. Silakan coba lagi.');
      }
    } catch (err: any) {
      console.error('Scan portfolio failed:', err);
      setIsAnalyzing(false);
      setErrorMessage('Gagal memproses screenshot portofolio. Coba lagi dengan gambar yang lebih jelas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in transition-colors duration-300">
      <div className="glass-panel rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative my-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Scan Portofolio Investasi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ekstraksi Ticker & Jumlah Lot secara Otomatis</p>
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
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-teal-500/40 hover:border-teal-500 bg-teal-500/5 hover:bg-teal-500/10 transition-all text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 group-hover:scale-110 flex items-center justify-center transition-all mb-2 shadow-md">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white mb-0.5">Ambil Kamera</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Foto Langsung HP</span>
                </button>

                {/* Option 2: Galeri Smartphone */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 flex items-center justify-center transition-all mb-2 shadow-md">
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
                alt="Screenshot Portofolio Investasi"
                className="object-contain max-h-64 w-full"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-rose-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleStartScan}
          disabled={!selectedImage || isAnalyzing}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 active:scale-95"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengekstrak Aset Investasi...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Ekstrak Aset Investasi AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
