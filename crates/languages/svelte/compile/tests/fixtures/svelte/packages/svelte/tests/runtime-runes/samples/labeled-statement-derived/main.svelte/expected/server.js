import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = $.derived(() => false);
	let result = 'correct';

	label: if (value()) result = 'wrong';

	$$renderer.push(`<p>${$.escape(result)}</p>`);
}