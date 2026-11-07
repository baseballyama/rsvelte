import * as $ from 'svelte/internal/server';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, items, onclick } = $$props;

		$$renderer.push(`<button>${$.escape(item.name)} ${$.escape(items.includes(item))}</button>`);
	});
}