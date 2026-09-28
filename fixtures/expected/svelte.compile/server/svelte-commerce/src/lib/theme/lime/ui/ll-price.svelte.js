import * as $ from 'svelte/internal/server';
import { formatPrice } from '$lib/core/utils';

export default function Ll_price($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Lime price primitive.
		 * Plum selling price with an optional struck-through MRP, matching the
		 * quiet, un-bold luxury treatment of the source product listings.
		 */
		let { price, mrp, currencyCode = '', align = 'center', size = 'md' } = $$props;

		const hasDiscount = $.derived(() => !!mrp && !!price && mrp > price);

		$$renderer.push(`<div${$.attr_class(`ll-price ll-price--${$.stringify(size)}`, 'svelte-towglw')}${$.attr_style(`justify-content: ${align === 'center' ? 'center' : 'flex-start'};`)}><span class="ll-price-now svelte-towglw">${$.escape(formatPrice(price, currencyCode))}</span> `);

		if (hasDiscount()) {
			$$renderer.push(`<!--[0--><span class="ll-price-was svelte-towglw">${$.escape(formatPrice(mrp, currencyCode))}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}