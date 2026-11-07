import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = $.derived(() => {
		const value = 0;

		return value;
	});

	$$renderer.push(`<div>${$.escape(value())}</div>`);
}