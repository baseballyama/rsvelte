import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<div>Hello</div> <div>world</div> <div>Bye</div> <div>World</div>`);
	});

	$$renderer.push(`<!--]-->`);
}