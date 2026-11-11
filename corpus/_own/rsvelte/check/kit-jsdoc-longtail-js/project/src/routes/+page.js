// TypeScript's JSDoc scanner parses several tags per line, so this `@type`
// counts as `hasTypeDefinition` and the file is left alone — `input` stays a
// number.
/** @typedef {string} Ignored @type {(input: number) => { ok: boolean }} */
export const load = (input) => ({ ok: input > 0 });

// A rest parameter counts towards official's `parameters.length`, so `entries`
// — only typed when it takes none — is left alone.
export function entries(...args) {
	return [{ slug: String(args.length) }];
}
