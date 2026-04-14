const ORDER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const ORDER_CODE_LENGTH = 5;
const MAX_GENERATION_ATTEMPTS = 10;

function getOrderPrefix(date = new Date()) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

function randomSuffix(length = ORDER_CODE_LENGTH) {
  let output = "";
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ORDER_CODE_ALPHABET.length);
    output += ORDER_CODE_ALPHABET[randomIndex];
  }
  return output;
}

export function createOrderCode(date = new Date()) {
  return `${getOrderPrefix(date)}${randomSuffix()}`;
}

export async function generateUniqueOrderCode(
  exists: (code: string) => Promise<boolean>,
  date = new Date(),
) {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const code = createOrderCode(date);
    if (!(await exists(code))) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique order code.");
}

export const ORDER_CODE_MONTHLY_CAPACITY = ORDER_CODE_ALPHABET.length ** ORDER_CODE_LENGTH;
