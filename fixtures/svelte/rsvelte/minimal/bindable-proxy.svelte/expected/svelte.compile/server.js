import * as $ from 'svelte/internal/server';

export default function Bindable_proxy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items = [], config = { open: false } } = $$props;

		$$renderer.push(`<button type="button">${$.escape(items.length)}</button> <p>${$.escape(config.open)}</p>`);
		$.bind_props($$props, { items, config });
	});
}