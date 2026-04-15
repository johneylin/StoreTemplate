export function getBlobStoreAccess() {
  return process.env.BLOB_STORE_ACCESS === "private" ? "private" : "public";
}

export function getPrivateBlobProxyUrl(pathname: string) {
  return `/api/blob?pathname=${encodeURIComponent(pathname)}`;
}
