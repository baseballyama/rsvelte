import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { providers } from './providers/store';
import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { base } from '$app/paths';
import { page } from '$app/state';

export default function CreateMessageDropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Popover($$renderer, {
			padding: 'none',
			placement: 'bottom-end',
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { toggle }) => {
					$$renderer.push(`<!--[-->`);

					$.slot($$renderer, $$props, 'default', { toggle }, () => {
						Button($$renderer, {
							event: 'create_message',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Create message`);
							},

							$$slots: {
								default: true,
								start: ($$renderer) => {
									Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
								}
							}
						});
					});

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

									if (ActionMenu.Item.Anchor) {
										$$renderer.push('<!--[-->');

										ActionMenu.Item.Anchor($$renderer, {
											leadingIcon: option.icon,
											href: `${base}/project-${page.params.region}-${page.params.project}/messaging/create-${type}`,
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
	});
}