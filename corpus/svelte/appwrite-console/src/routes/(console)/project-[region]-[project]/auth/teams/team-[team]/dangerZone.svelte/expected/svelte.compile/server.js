import * as $ from 'svelte/internal/server';
import { AvatarInitials, BoxAvatar, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import DeleteTeam from './deleteTeam.svelte';
import { team } from './store';

export default function DangerZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showDelete = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The team will be permanently deleted, including all data associated with this team. This action is
    irreversible.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete team`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								$$slots: {
									image: ($$renderer) => {
										{
											AvatarInitials($$renderer, { name: $.store_get($$store_subs ??= {}, '$team', team).name });
										}
									},

									title: ($$renderer) => {
										{
											$$renderer.push(`<h6 class="u-bold u-trim-1">${$.escape($.store_get($$store_subs ??= {}, '$team', team).name)}</h6> <span>${$.escape($.store_get($$store_subs ??= {}, '$team', team).total)} Members</span>`);
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
								event: 'delete_team',
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

			DeleteTeam($$renderer, {
				team: $.store_get($$store_subs ??= {}, '$team', team),
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