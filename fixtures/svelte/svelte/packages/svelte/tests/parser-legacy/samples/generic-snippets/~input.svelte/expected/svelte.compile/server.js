import * as $ from 'svelte/internal/server';

function generic($$renderer, val) {
	$$renderer.push(`<!---->${$.escape(val)}`);
}

function complex_generic($$renderer, val) {
	$$renderer.push(`<!---->${$.escape(val)}`);
}

export default function Input($$renderer) {}