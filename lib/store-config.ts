function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getPickupAddress() {
  return {
    street: getRequiredEnv("PICKUP_STREET"),
    city: getRequiredEnv("PICKUP_CITY"),
    state: getRequiredEnv("PICKUP_STATE"),
    postCode: getRequiredEnv("PICKUP_POSTCODE"),
  };
}

export function getETransferEmail() {
  return getRequiredEnv("ETRANSFER_EMAIL");
}

export function formatAddress(address: {
  street: string;
  city: string;
  state: string;
  postCode: string;
}) {
  return `${address.street}, ${address.city}, ${address.state} ${address.postCode}`;
}
