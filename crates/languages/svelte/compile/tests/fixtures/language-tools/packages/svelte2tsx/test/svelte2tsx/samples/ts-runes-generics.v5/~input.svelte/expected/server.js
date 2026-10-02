import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let { a, b } = $$props;
	let x = 0;
	let y = $.derived(() => x * 2);
}