/**
 * The svelte error code carried by a thrown compiler error, from either
 * compiler. Shared so the collected-corpus gate and the matrix gate agree about
 * what "the same error" means.
 */
export function errorCode(e) {
	const message = String(e?.message ?? e);
	// A pre-#2446 rsvelte binding carried a generic `code` ("GenericFailure")
	// with the real svelte code embedded in a Rust `Debug` dump; keep extracting
	// it so an older binding still scores code parity instead of reporting
	// `null` everywhere.
	const code = e?.code ?? null;
	if (code && code !== 'GenericFailure') return code;
	const m = message.match(/svelte\.dev\/e\/([a-z0-9_]+)/) ?? message.match(/code: "([a-z0-9_]+)"/);
	return m ? m[1] : code;
}
