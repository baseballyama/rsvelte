import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	let count = 0;

	function increment() {
		count += 1;
	}

	$$renderer.push(`<button><!--[-->`);
	$.slot($$renderer, $$props, 'default', { count }, null);
	$$renderer.push(`<!--]--></button> <!--[-->`);
	$.slot($$renderer, $$props, 'named', {}, null);
	$$renderer.push(`<!--]-->`);
}