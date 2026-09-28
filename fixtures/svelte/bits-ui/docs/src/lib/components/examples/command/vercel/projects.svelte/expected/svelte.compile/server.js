import * as $ from 'svelte/internal/server';
import Item from "./item.svelte";

export default function Projects($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like({ length: 6 });

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let _ = each_array[i];

		Item($$renderer, {
			value: `Project ${$.stringify(i + 1)}`,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Project ${$.escape(i + 1)}`);
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]-->`);
}