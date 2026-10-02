import * as $ from 'svelte/internal/server';
import { CustomFilters } from '$lib/components/filters';
import { addFilterAndApply } from './quickFilters';
import { parsedTags } from './setFilters';
import Menu from '../menu/menu.svelte';
import { Button } from '$lib/elements/forms';
import { Icon } from '@appwrite.io/pink-svelte';
import { IconFilterLine } from '@appwrite.io/pink-icons-svelte';
import QuickfiltersSubMenu from './quickfiltersSubMenu.svelte';

export default function QuickFilters($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			columns,
			filterCols,
			analyticsSource,
			buttonVariant = 'ghost'
		} = $$props;

		Menu($$renderer, {
			children: ($$renderer) => {
				if (buttonVariant === 'secondary') {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						ariaLabel: 'Filters',
						secondary: true,
						size: 's',
						badge: $.store_get($$store_subs ??= {}, '$parsedTags', parsedTags)?.length
							? `${$.store_get($$store_subs ??= {}, '$parsedTags', parsedTags).length}`
							: undefined,

						children: ($$renderer) => {
							$$renderer.push(`<span class="text">Filters</span>`);
						},

						$$slots: {
							default: true,
							start: ($$renderer) => {
								Icon($$renderer, { icon: IconFilterLine, size: 's', slot: 'start' });
							}
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						ariaLabel: 'Filters',
						text: true,
						icon: true,
						size: 's',
						badge: $.store_get($$store_subs ??= {}, '$parsedTags', parsedTags)?.length
							? `${$.store_get($$store_subs ??= {}, '$parsedTags', parsedTags).length}`
							: undefined,

						children: ($$renderer) => {
							Icon($$renderer, { icon: IconFilterLine, size: 's' });
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},

			$$slots: {
				default: true,
				menu: ($$renderer) => {
					{
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(filterCols.filter((f) => f?.options));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let filter = each_array[$$index];

							if (filter.options) {
								$$renderer.push('<!--[0-->');
								QuickfiltersSubMenu($$renderer, { filter, variant: filter?.array ? 'checkbox' : 'radio' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					}
				},

				end: ($$renderer) => {
					{
						CustomFilters($$renderer, { columns });
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}