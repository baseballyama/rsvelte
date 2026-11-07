import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { melt } from '@melt-ui/svelte';
import { Card } from '@appwrite.io/pink-svelte';

export default function SubMenu($$renderer, $$props) {
	const $$slots = $.sanitize_slots($$props);

	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// get parent builder for toggle state!
		const { builders, separator } = getContext('menuBuilder');

		const { createSubmenu } = builders;
		const { elements: { subMenu, subTrigger } } = createSubmenu();

		$$renderer.push(`<div><!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--></div> <div class="subMenu svelte-1rwppfr">`);

		if (Card.Base) {
			$$renderer.push('<!--[-->');

			Card.Base($$renderer, {
				padding: 'none',
				children: ($$renderer) => {
					if ($$slots.start) {
						$$renderer.push(`<!--[0--><!--[-->`);
						$.slot($$renderer, $$props, 'start', {}, null);
						$$renderer.push(`<!--]--> <div class="separator"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <!--[-->`);
					$.slot($$renderer, $$props, 'menu', {}, null);
					$$renderer.push(`<!--]--> `);

					if ($$slots.end) {
						$$renderer.push(`<!--[0--><div class="separator"></div> <!--[-->`);
						$.slot($$renderer, $$props, 'end', {}, null);
						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}