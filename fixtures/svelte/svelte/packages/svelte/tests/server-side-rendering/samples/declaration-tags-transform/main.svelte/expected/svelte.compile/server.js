import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	{
		let dt = $.derived(() => Date.parse("2026-10-01T00:00:00Z"));

		$$renderer.push(`<div>${$.escape(typeof dt())}</div>`);
	}
}