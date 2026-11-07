import * as $ from 'svelte/internal/server';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item } = $$props;

		$$renderer.push(`<input${$.attr('value', item.heading)}/>`);
	});
}