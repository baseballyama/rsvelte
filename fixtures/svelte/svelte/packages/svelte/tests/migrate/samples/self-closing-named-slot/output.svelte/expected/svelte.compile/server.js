import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	{
		function test($$renderer) {
			$$renderer.push(`<div></div>`);
		}

		Component($$renderer, { test, $$slots: { test: true } });
	}
}