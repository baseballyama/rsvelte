import * as $ from 'svelte/internal/server';
import { wizard } from '$lib/stores/wizard';
import { providers } from './store';
import Create from './create.svelte';
import { providerType, provider } from './wizard/store';
import { Providers } from '../provider.svelte';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { MessagingProviderType } from '@appwrite.io/console';
import { ActionMenu, Popover } from '@appwrite.io/pink-svelte';

export default function CreateProviderDropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		Popover($$renderer, {
			padding: 'none',
			placement: 'bottom-end',
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { toggle }) => {
					$$renderer.push(`<!--[-->`);
					$.slot($$renderer, $$props, 'default', { toggle }, null);
					$$renderer.push(`<!--]-->`);
				},

				tooltip: ($$renderer) => {
					if (ActionMenu.Root) {
						$$renderer.push('<!--[-->');

						ActionMenu.Root($$renderer, {
							slot: 'tooltip',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(Object.entries(providers));

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let [type, option] = each_array[$$index];

									if (ActionMenu.Item.Button) {
										$$renderer.push('<!--[-->');

										ActionMenu.Item.Button($$renderer, {
											leadingIcon: option.icon,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(option.name)}`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}