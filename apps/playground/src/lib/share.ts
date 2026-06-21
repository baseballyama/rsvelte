// Encode / decode the playground source so it can ride along in the URL and be
// shared by copy-pasting the link. We keep the editor contents in the URL
// *hash* (`#code=…`) rather than a query parameter so it never reaches the
// static server, has no practical length limit, and stays out of request logs.
//
// The payload is the UTF-8 bytes of the source, base64url-encoded (RFC 4648
// §5: `+`→`-`, `/`→`_`, padding stripped). This is dependency-free and fully
// synchronous, which keeps the reactive URL-sync path simple. base64 inflates
// the byte length by ~33%, which is fine for the few-kB snippets a playground
// deals with.

/** base64url-encode the UTF-8 bytes of `code`. */
export function encodeCode(code: string): string {
  const bytes = new TextEncoder().encode(code);
  let binary = "";
  // Chunk to stay well under any arg-count limits on String.fromCharCode.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Inverse of {@link encodeCode}. Returns `null` if the payload is malformed. */
export function decodeCode(encoded: string): string | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Read the shared source out of a URL hash like `#code=…` (or `code=…`). */
export function readSharedCode(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const code = params.get("code");
  return code ? decodeCode(code) : null;
}
