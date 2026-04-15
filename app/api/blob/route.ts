import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getBlobStoreAccess } from "@/lib/blob-storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (getBlobStoreAccess() !== "private") {
    return NextResponse.json({ error: "Blob proxy is only used for private stores." }, { status: 404 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured." }, { status: 500 });
  }

  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname) {
    return NextResponse.json({ error: "Missing pathname." }, { status: 400 });
  }

  const result = await get(pathname, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return new NextResponse(result.body, {
    status: 200,
    headers: {
      "Content-Type": result.blob.contentType,
      ETag: result.blob.etag,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
