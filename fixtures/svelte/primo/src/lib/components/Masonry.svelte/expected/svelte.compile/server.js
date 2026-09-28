import * as $ from 'svelte/internal/server';
import { Skeleton } from '$lib/components/ui/skeleton';

export default function Masonry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			loading = false,
			class: className = '',
			columnCount = null,
			skeletonCount = 8,
			getKey = (item) => item?.id ?? item?.key ?? item,
			children
		} = $$props;

		// Dynamically determine number of columns based on screen width
		let window_width = typeof window !== 'undefined' ? window.innerWidth : 1200;

		const columns = $.derived(() => columnCount ?? (window_width < 600
			? 1
			: window_width < 700 ? 2 : window_width < 1200 ? 3 : 4));

		// Generate random ratios for skeleton cards
		const skeleton_ratios = $.derived(() => Array.from({ length: columns() }, () => Array.from({ length: Math.ceil(skeletonCount / columns()) }, () => 0.5 + Math.random())));

		// Split items into columns for masonry layout
		const columnized_items = $.derived(() => items
			? Array.from({ length: columns() }, (_, i) => items.filter((_, index) => index % columns() === i))
			: []);

		$$renderer.push(`<div${$.attr_class(`masonry ${$.stringify(className)}`, 'svelte-99y4nj')}${$.attr_style('', {
			'grid-template-columns': `repeat(${$.stringify(columns())}, 1fr)`
		})}>`);

		if (loading || items === undefined) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(skeleton_ratios());

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let column_ratios = each_array[$$index_1];

				$$renderer.push(`<ul class="svelte-99y4nj"><!--[-->`);

				const each_array_1 = $.ensure_array_like(column_ratios);

				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
					let ratio = each_array_1[$$index];

					$$renderer.push(`<li>`);

					Skeleton($$renderer, {
						class: 'w-full',
						style: `aspect-ratio: ${$.stringify(ratio)}`
					});

					$$renderer.push(`<!----></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><!--[-->`);

			const each_array_2 = $.ensure_array_like(columnized_items());

			for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
				let column = each_array_2[$$index_3];

				$$renderer.push(`<ul class="svelte-99y4nj"><!--[-->`);

				const each_array_3 = $.ensure_array_like(column);

				for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
					let item = each_array_3[$$index_2];

					$$renderer.push(`<li>`);
					children($$renderer, item);
					$$renderer.push(`<!----></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}