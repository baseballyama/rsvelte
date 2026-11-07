import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let count = 0;

	function increment() {
		count += 1;
	}

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', { count }, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'foo', { count }, null);
	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'bar', {}, null);
	$$renderer.push(`<!--]--> <button>+1</button></div>`);
}