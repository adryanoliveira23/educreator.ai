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
