import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const maxSizes = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
} as const;

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const kind = formData.get("kind");
    const file = formData.get("file");

    if (kind !== "image" && kind !== "video") {
      return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
    }

    if (!(file instanceof Blob) || typeof (file as File).arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file was received for upload." }, { status: 400 });
    }

    const uploadFile = file as File;

    if (!uploadFile.type.startsWith(`${kind}/`)) {
      return NextResponse.json({ error: `Please upload a valid ${kind} file.` }, { status: 400 });
    }

    if (uploadFile.size > maxSizes[kind]) {
      const maxMegabytes = Math.floor(maxSizes[kind] / (1024 * 1024));
      return NextResponse.json({ error: `${kind === "image" ? "Image" : "Video"} files must be ${maxMegabytes}MB or smaller.` }, { status: 400 });
    }

    const filename = sanitizeFilename(uploadFile.name || `${kind}.${uploadFile.type.split("/")[1] || "bin"}`);
    const pathname = `products/${kind}/${Date.now()}-${filename}`;

    const blob = await put(pathname, uploadFile, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
      contentType: uploadFile.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
