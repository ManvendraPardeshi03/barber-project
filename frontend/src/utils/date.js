// Convert backend UTC slot to local Date
export function parseSlotUTCtoLocal(slotTime) {
  if (!slotTime) return null;
  const utc = new Date(slotTime);
  return new Date(
    utc.getUTCFullYear(),
    utc.getUTCMonth(),
    utc.getUTCDate(),
    utc.getUTCHours(),
    utc.getUTCMinutes()
  );
}
