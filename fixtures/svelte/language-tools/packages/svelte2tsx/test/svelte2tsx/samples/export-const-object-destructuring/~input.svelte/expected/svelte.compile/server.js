import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const obj = { a: 1, b: 2, nested: { c: 3, d: 4 } };
	const { a, b, nested: { c, d: g } } = obj;

	$.bind_props($$props, { a, b, c, g });
}