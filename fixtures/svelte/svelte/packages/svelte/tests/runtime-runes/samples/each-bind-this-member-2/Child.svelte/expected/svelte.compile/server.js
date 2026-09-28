import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item = void 0 } = $$props;

		$$renderer.push(`<div>${$.escape(item.text)}</div>`);
		$.bind_props($$props, { item });
	});
}