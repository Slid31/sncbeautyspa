"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full h-56 rounded-lg overflow-hidden border border-slate-200">
          <Image src={value} alt="Service image" fill className="object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-56 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-pink-500 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-500">Click to upload an image</p>
            </>
          )}
        </div>
      )}

      {!value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
          ) : (
            <><ImagePlus className="h-4 w-4 mr-2" /> Choose image</>
          )}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
