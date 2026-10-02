import * as $ from 'svelte/internal/server';

function top($$renderer) {}

export default function Input($$renderer) {
	// no error
	top;

	function nested1($$renderer) {}

	$$renderer.push(`<div>`);
	nested1($$renderer);
	$$renderer.push(`<!----></div>  `);
	nested1($$renderer);
	$$renderer.push(`<!---->`);
}