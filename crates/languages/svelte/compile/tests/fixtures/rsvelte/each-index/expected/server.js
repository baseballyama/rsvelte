import * as $ from 'svelte/internal/server';

export default function Each_index($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		$$renderer.push(`<ol><!--[-->`);
		const each_array = $.ensure_array_like(items);
		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			$$renderer.push(`<li>${$.escape(i + 1)}: ${$.escape(item)}</li>`);
		}
		$$renderer.push(`<!--]--></ol> <p>${$.escape(items.length)} items</p>`);
	});
}
