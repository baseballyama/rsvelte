import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let inited = false;

		if (inited) {
			$$renderer.push(`<!--[0--><span>`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}