import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let count = 0;

	$$renderer.push(`<button>+1</button> <!--[-->`);
	$.slot($$renderer, $$props, 'default', { count }, null);
	$$renderer.push(`<!--]-->`);
}