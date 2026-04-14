"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { ImageIcon, LoaderCircle, Link2, UploadCloud, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type BlobUploadFieldProps = {
  name: "imageUrl" | "videoUrl";
  label: string;
  kind: "image" | "video";
  accept: string;
  required?: boolean;
  defaultValue?: string;
  helperText: string;
};

type UploadResponse = {
  url: string;
};

export function BlobUploadField({
  name,
  label,
  kind,
  accept,
  required = false,
  defaultValue = "",
  helperText,
}: BlobUploadFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Upload failed.");
      }

      const payload = (await response.json()) as UploadResponse;
      setValue(payload.url);
      event.target.value = "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const hasPreview = Boolean(value);
  const Icon = kind === "image" ? ImageIcon : Video;

  return (
    <div className="space-y-2">
      <label className="block space-y-2 text-sm font-medium text-slate-700">
        {label}
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {uploading ? "Uploading..." : `Upload ${kind}`}
              <input type="file" accept={accept} onChange={handleUpload} disabled={uploading} className="hidden" />
            </label>
            <p className="text-xs leading-5 text-slate-500">{helperText}</p>
          </div>

          <div className="mt-3 rounded-[1.25rem] border border-dashed border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Link2 className="h-3.5 w-3.5" />
              Media URL
            </div>
            <input
              name={name}
              type="url"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required={required}
              placeholder={kind === "image" ? "https://.../product-image.jpg" : "https://.../product-video.mp4"}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
            />
          </div>
        </div>
      </label>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      <div className={cn("overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100", !hasPreview && "border-dashed")}>
        {hasPreview ? (
          kind === "image" ? (
            <div className="relative h-48 w-full">
              <Image src={value} alt={`${label} preview`} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
            </div>
          ) : (
            <video src={value} controls className="h-48 w-full bg-slate-950 object-cover" />
          )
        ) : (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-slate-500">
            <Icon className="h-4 w-4" />
            No {kind} selected yet
          </div>
        )}
      </div>
    </div>
  );
}