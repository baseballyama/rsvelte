import * as $ from 'svelte/internal/server';
import { CardGrid, AvatarInitials } from '$lib/components';
import { Container } from '$lib/layout';
import { toLocaleDateTime } from '$lib/helpers/date';
import { team } from './store';
import UpdatePrefs from './updatePrefs.svelte';
import UpdateName from './updateName.svelte';
import DangerZone from './dangerZone.svelte';
import { Typography } from '@appwrite.io/pink-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		Container($$renderer, {
			children: ($$renderer) => {
				CardGrid($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">`);
						AvatarInitials($$renderer, { name: $.store_get($$store_subs ??= {}, '$team', team).name });
						$$renderer.push(`<!----> `);

						if (Typography.Title) {
							$$renderer.push('<!--[-->');

							Typography.Title($$renderer, {
								size: 's',
								truncate: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$team', team).name)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
					},

					$$slots: {
						default: true,
						aside: ($$renderer) => {
							{
								$$renderer.push(`<div><p>${$.escape($.store_get($$store_subs ??= {}, '$team', team).total)} Members</p> <p>Created on ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$team', team).$createdAt))}</p></div>`);
							}
						}
					}
				});

				$$renderer.push(`<!----> `);
				UpdateName($$renderer, {});
				$$renderer.push(`<!----> `);
				UpdatePrefs($$renderer, {});
				$$renderer.push(`<!----> `);
				DangerZone($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}