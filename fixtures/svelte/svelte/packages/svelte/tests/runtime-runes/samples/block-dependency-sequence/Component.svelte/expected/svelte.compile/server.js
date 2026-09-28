import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { item } = $$props;

		$$renderer.push(`<div>`);

		if (item) {
			$$renderer.push(`<!--[0-->${$.escape(item.length)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}