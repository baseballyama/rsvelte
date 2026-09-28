import * as $ from 'svelte/internal/server';
import { Star } from '@lucide/svelte';

export default function Ll_rating($$renderer, $$props) {
	/**
	 * Lime rating primitive — a quiet 5-star row.
	 * Renders filled / half / empty stars in the plum brand tone.
	 */
	let { value = 0, count, size = 14 } = $$props;

	const stars = $.derived(() => Array.from({ length: 5 }, (_, i) => {
		const fill = Math.max(0, Math.min(1, value - i));

		return fill >= 0.75 ? 'full' : fill >= 0.25 ? 'half' : 'empty';
	}));

	if (value > 0) {
		$$renderer.push(`<!--[0--><div class="ll-rating svelte-19vthga"${$.attr('aria-label', `Rated ${$.stringify(value)} out of 5`)}><div class="ll-rating-stars svelte-19vthga"><!--[-->`);

		const each_array = $.ensure_array_like(stars());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let state = each_array[$$index];

			$$renderer.push(`<span${$.attr_class(`ll-star ll-star--${$.stringify(state)}`, 'svelte-19vthga')}${$.attr_style(`width:${$.stringify(size)}px; height:${$.stringify(size)}px;`)}>`);

			Star($$renderer, {
				style: `width:${$.stringify(size)}px; height:${$.stringify(size)}px;`,
				strokeWidth: 1.25
			});

			$$renderer.push(`<!----></span>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (count != null) {
			$$renderer.push(`<!--[0--><span class="ll-rating-count svelte-19vthga">(${$.escape(count)})</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}