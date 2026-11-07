import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	let { props } = $$props;
	let state = 0;
	let derived = $.derived(() => state * 2);

	$$renderer.push(`<!---->0 0`);
}