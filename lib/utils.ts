/**
 * Formats a digits-only string as a WhatsApp number: (XX) XXXXX-XXXX
 */
export const maskWhatsApp = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

/**
 * Strips all non-digit characters from a string.
 */
export const cleanPhone = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Decodes common HTML entities to their character equivalents.
 */
export const decodeHtmlEntities = (str: string): string => {
  if (!str) return "";
  const map: { [key: string]: string } = {
    "&quot;": '"',
    "&apos;": "'",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&#39;": "'",
    "&#34;": '"',
  };
  return str.replace(/&[a-z0-9#]+;/gi, (m) => map[m] || m);
};
