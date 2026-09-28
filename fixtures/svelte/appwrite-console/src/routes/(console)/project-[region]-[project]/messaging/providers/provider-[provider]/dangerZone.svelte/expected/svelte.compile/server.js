import * as $ from 'svelte/internal/server';
import { CardGrid, BoxAvatar } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { provider } from './store';
import { toLocaleDateTime } from '$lib/helpers/date';
import DeleteProvider from './deleteProvider.svelte';
import { page } from '$app/state';
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

let showDelete = writable(false);

export const promptDeleteProvider = (id) => {
	showDelete.set(true);
	goto(`${base}/project-${page.params.region}-${page.params.project}/messaging/providers/provider-${id}`);
};

export default function DangerZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The provider's instance will be permanently deleted. This action is irreversible.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete provider`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Last updated: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$provider', provider).$updatedAt))}</p>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`<h6 class="u-bold u-trim-1">${$.escape($.store_get($$store_subs ??= {}, '$provider', provider).name)}</h6>`);
										}
									}
								}
							});
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								event: 'delete_messaging_provider',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			DeleteProvider($$renderer, {
				get showDelete() {
					return $.store_get($$store_subs ??= {}, '$showDelete', showDelete);
				},

				set showDelete($$value) {
					$.store_set(showDelete, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}