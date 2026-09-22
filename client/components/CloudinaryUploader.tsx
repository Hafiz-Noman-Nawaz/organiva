'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface CloudinaryUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  value = '',
  onChange,
  folder = 'organiva/catalog',
  label = 'Image',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (under 12MB)
    if (file.size > 12 * 1024 * 1024) {
      setError('File is too large. Please choose an image under 12MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Read file as base64 Data URL
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const dataUri = await base64Promise;

      const token = localStorage.getItem('organiva_admin_token') || undefined;
      const res = await api.post(
        '/upload',
        {
          image: dataUri,
          folder,
        },
        token
      );

      if (res.success && res.url) {
        onChange(res.url);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      setError(err.message || 'Failed to upload image to Cloudinary');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isCloudinary = value && value.includes('cloudinary.com');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-xs text-[#171A18]">{label}</label>
        {isCloudinary && (
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-[#5B755D] bg-[#EBF1EB] px-2 py-0.5 rounded-full border border-[#5B755D]/20">
            <CheckCircle2 size={10} />
            Cloudinary CDN
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#5B755D]/25 shrink-0 flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <ImageIcon size={20} className="text-gray-400" />
          )}
        </div>

        {/* Upload Button and URL Input */}
        <div className="flex-1 w-full space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>Upload File</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste image URL (https://... or /images/...)"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 focus:border-[#5B755D] focus:outline-none bg-white"
            />
          </div>

          {success && (
            <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Uploaded successfully to Cloudinary!
            </p>
          )}

          {error && (
            <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
