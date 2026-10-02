import * as $ from 'svelte/internal/server';
import { AvatarInitials, BoxAvatar, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { user } from '$lib/stores/user';
import Delete from './delete.svelte';

export default function DeleteAccount($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showDelete = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Your account will be permanently deleted and access will be lost to any of your teams and data. This
    action is irreversible.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete account`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								$$slots: {
									image: ($$renderer) => {
										{
											AvatarInitials($$renderer, {
												size: 'm',
												name: $.store_get($$store_subs ??= {}, '$user', user).name || $.store_get($$store_subs ??= {}, '$user', user).email
											});
										}
									},

									title: ($$renderer) => {
										{
											$$renderer.push(`<span class="u-bold u-trim-1" data-private="">${$.escape($.store_get($$store_subs ??= {}, '$user', user).name || 'User')}</span>`);
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