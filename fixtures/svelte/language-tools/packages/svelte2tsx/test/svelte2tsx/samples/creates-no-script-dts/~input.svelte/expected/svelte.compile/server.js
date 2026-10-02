import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<button><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></button> `);

	$.await($$renderer, Promise.resolve(0), () => {}, (n) => {
		$$renderer.push(`${$.escape(n)}`);
	});

	$$renderer.push(`<!--]-->`);
}