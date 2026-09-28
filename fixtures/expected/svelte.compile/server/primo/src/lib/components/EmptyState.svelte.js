import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button';

export default function EmptyState($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icon,
			title,
			description,
			class: className = '',
			link = null,
			button = null
		} = $$props;

		$$renderer.push(`<div${$.attr_class(`flex flex-col items-center justify-center gap-6 flex-1 ${$.stringify(className)}`)}><div class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full dark:bg-gray-800">`);

		if (icon) {
			$$renderer.push('<!--[-->');
			icon($$renderer, { class: 'w-10 h-10 text-gray-500 dark:text-gray-400' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> <div class="space-y-2 text-center"><h2 class="text-2xl font-bold tracking-tight">${$.escape(title)}</h2> <p class="text-gray-500 dark:text-gray-400 text-balance max-w-[30rem]">${$.escape(description)}</p></div> `);

		if (link) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				href: link.url,
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<span>${$.escape(link.label)}</span> `);

					if (link.icon) {
						$$renderer.push('<!--[0-->');

						if (link.icon) {
							$$renderer.push('<!--[-->');
							link.icon($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else if (button) {
			$$renderer.push('<!--[1-->');

			Button($$renderer, {
				onclick: button.onclick,
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<span>${$.escape(button.label)}</span> `);

					if (button.icon) {
						$$renderer.push('<!--[0-->');

						if (button.icon) {
							$$renderer.push('<!--[-->');
							button.icon($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}