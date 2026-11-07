import * as $ from 'svelte/internal/server';

function f($$renderer) {
	$$renderer.push(`<!---->${$.escape(location.href)}`);
}

export default function In_template02_input($$renderer) {}