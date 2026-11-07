import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const obj = { a: 1, b: 2, nested: { c: 3, d: 4 } };
	const { a, b, nested: { c, d: g } } = obj;
	var $$exports = { a, b, c, g };

	return $.pop($$exports);
}