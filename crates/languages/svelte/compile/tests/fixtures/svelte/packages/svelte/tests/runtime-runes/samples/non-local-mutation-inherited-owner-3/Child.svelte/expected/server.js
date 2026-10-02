import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item } = $$props;

		function onclick() {
			item.name = `${item.name} edited`;
		}

		$$renderer.push(`<div>${$.escape(item?.name)}</div> <button>Then click here</button>`);
	});
}