import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 1;
	let double = $.derived(() => count * 2);
	let binding = null;

	$$renderer.push(`<!---->1 2 <input type="number"${$.attr('value', binding)}/>`);
}