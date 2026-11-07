import * as $ from 'svelte/internal/server';
import { BoxAvatar, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import Delete from './deleteModal.svelte';
import { func } from '../store';

export default function DangerZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showDelete = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The function will be permanently deleted, including all deployments associated with it.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete function`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<p>Last updated: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$func', func).$updatedAt))}</p>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`<h6 class="u-bold u-trim-1">${$.escape($.store_get($$store_subs ??= {}, '$func', func).name)}</h6>`);
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

			Delete($$renderer, {
				projectFunction: $.store_get($$store_subs ??= {}, '$func', func),
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
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