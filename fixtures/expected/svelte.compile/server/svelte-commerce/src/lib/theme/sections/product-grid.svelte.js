import * as $ from 'svelte/internal/server';
import SectionHeading from './section-heading.svelte';
import { text } from './utils.js';

export default function Product_grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * A grid of real catalogue products with the theme's own product card, plus the empty state
		 * for a store that has none yet. Never invents products to fill the grid.
		 */
		let { ctx, options = {} } = $$props;

		const products = $.derived(() => ctx.featuredProducts?.slice(0, options.limit ?? 8) ?? []);
		const emptyTitle = $.derived(() => text(ctx, options.empty?.title));
		const emptyText = $.derived(() => text(ctx, options.empty?.text));
		const Card = $.derived(() => ctx.ProductCard);

		if (products().length || !options.requireProducts) {
			$$renderer.push(`<!--[0--><section${$.attr_class(`ts-product-grid ${$.stringify(options.class ?? '')}`)}>`);

			if (options.heading) {
				$$renderer.push('<!--[0-->');
				SectionHeading($$renderer, { ctx, options: options.heading });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (products().length && Card()) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`ts-products ${$.stringify(options.gridClass ?? '')}`)}><!--[-->`);

				const each_array = $.ensure_array_like(products());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let product = each_array[$$index];

					if (Card()) {
						$$renderer.push('<!--[-->');

						Card()($$renderer, {
							product,
							themeContent: ctx.content,
							aspectRatio: options.aspectRatio ?? `${ctx.aspectWidth}:${ctx.aspectHeight}`
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]--></div>`);
			} else if (emptyTitle() || emptyText()) {
				$$renderer.push(`<!--[1--><div${$.attr_class(`ts-empty ${$.stringify(options.emptyClass ?? '')}`)}>`);

				if (emptyTitle()) {
					$$renderer.push(`<!--[0--><h3>${$.escape(emptyTitle())}</h3>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (emptyText()) {
					$$renderer.push(`<!--[0--><p>${$.escape(emptyText())}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}