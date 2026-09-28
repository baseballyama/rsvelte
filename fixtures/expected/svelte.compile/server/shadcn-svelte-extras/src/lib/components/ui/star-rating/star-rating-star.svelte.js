import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import StarHalfIcon from '@lucide/svelte/icons/star-half';
import StarIcon from '@lucide/svelte/icons/star';
import { RatingGroup } from 'bits-ui';

export default function Star_rating_star($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { index, state, class: className } = $$props;

		if (RatingGroup.Item) {
			$$renderer.push('<!--[-->');

			RatingGroup.Item($$renderer, {
				index,
				class: cn('ring-ring text-primary ring-offset-background group/item size-5 rounded-md ring-offset-2 outline-hidden group-aria-disabled:opacity-50 focus-visible:ring-2', className),
				children: ($$renderer) => {
					$$renderer.push(`<div class="relative size-full">`);

					StarIcon($$renderer, {
						class: cn('size-full fill-transparent transition-all', { 'fill-current': state === 'active' })
					});

					$$renderer.push(`<!----> `);

					StarHalfIcon($$renderer, {
						class: cn('absolute top-0 left-0 size-full fill-transparent transition-all group-data-[state=active]/item:fill-current', { 'ltr:fill-current': state === 'partial' })
					});

					$$renderer.push(`<!----> `);

					StarHalfIcon($$renderer, {
						class: cn('absolute top-0 right-0 size-full scale-x-[-1] fill-transparent transition-all group-data-[state=active]/item:fill-current', { 'rtl:fill-current': state === 'partial' })
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}