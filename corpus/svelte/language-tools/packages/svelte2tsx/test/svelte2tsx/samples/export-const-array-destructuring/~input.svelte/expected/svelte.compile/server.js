import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	const array = [1, 2, 3, [4]];
	const [a, b, c, [d]] = array;

	$.bind_props($$props, { a, b, c, d });
}