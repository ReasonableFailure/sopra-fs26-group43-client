/**
 * Normalize a portrait field into a value suitable for an <img src>.
 *
 * Backend usually returns the full data URL ("data:image/jpeg;base64,XXX")
 * via PlayerDTOMapper.bytesToBase64, but defensively we also accept a
 * bare base64 payload — older serializers or hand-rolled payloads can
 * drop the data-URL prefix, which makes <img> render the browser's
 * broken-image icon. This helper always returns either a renderable
 * data URL or null.
 */
export function portraitSrc(
  portrait: string | null | undefined,
): string | null {
  if (!portrait) return null;
  const trimmed = portrait.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;
  // Bare base64 — prepend a generic image data URL prefix. Browsers
  // sniff the actual format from the decoded bytes so the declared
  // media type doesn't have to match precisely.
  return `data:image/jpeg;base64,${trimmed}`;
}
