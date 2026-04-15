export const GUEST_DEVICE_COOKIE = "jp_guest_device";

export function createGuestDeviceId() {
  return crypto.randomUUID();
}

export function getGuestDeviceCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
