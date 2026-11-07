import * as $ from 'svelte/internal/server';
import * as StarRating from '$lib/components/ui/star-rating';

export default function Star_rating_readonly($$renderer) {
	{
		function children($$renderer, { items }) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				if (StarRating.Star) {
					$$renderer.push('<!--[-->');
					StarRating.Star($$renderer, $.spread_props([item]));
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		if (StarRating.Root) {
			$$renderer.push('<!--[-->');

			StarRating.Root($$renderer, {
				readonly: true,
				value: 2,
				children,
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}