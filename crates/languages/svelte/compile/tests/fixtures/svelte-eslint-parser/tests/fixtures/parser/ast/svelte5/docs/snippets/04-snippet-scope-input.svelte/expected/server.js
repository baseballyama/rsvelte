import * as $ from 'svelte/internal/server';

export default function _4_snippet_scope_input($$renderer) {
	function x($$renderer) {
		function y($$renderer) {
			$$renderer.push(`<!---->...`);
		}

		y($$renderer);
	}

	$$renderer.push(`<div>`);
	y($$renderer);
	$$renderer.push(`<!----></div> `);
	x($$renderer);
	$$renderer.push(`<!---->`);
}