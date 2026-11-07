import * as $ from 'svelte/internal/server';
import { RatingGroup } from "bits-ui";
import Star from "phosphor-svelte/lib/Star";

export default function Rating_group_demo_custom($$renderer, $$props) {
	let { value = 3.5, $$slots, $$events, ...restProps } = $$props;

	{
		function children($$renderer, { items }) {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				if (RatingGroup.Item) {
					$$renderer.push('<!--[-->');

					RatingGroup.Item($$renderer, {
						index: item.index,
						class: 'text-foreground data-[state=inactive]:text-muted-foreground data-disabled:cursor-not-allowed size-10 cursor-pointer transition-colors disabled:opacity-50 data-[readonly]:cursor-default md:size-8',
						children: ($$renderer) => {
							$$renderer.push(`<div class="relative size-full">`);
							Star($$renderer, { class: 'size-full fill-current', weight: 'fill' });
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		if (RatingGroup.Root) {
			$$renderer.push('<!--[-->');

			RatingGroup.Root($$renderer, $.spread_props([
				restProps,
				{
					value,
					class: 'flex gap-1',
					children,
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}