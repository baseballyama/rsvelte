import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<img${$.attr('src', item.src)}${$.attr('alt', `slider${$.stringify(i)}`)}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}