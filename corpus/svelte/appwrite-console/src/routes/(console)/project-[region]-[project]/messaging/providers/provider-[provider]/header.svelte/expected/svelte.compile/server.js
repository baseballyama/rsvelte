import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id } from '$lib/components';
import { Cover, CoverTitle } from '$lib/layout';
import { provider } from './store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;

		Cover($$renderer, {
			$$slots: {
				header: ($$renderer) => {
					{
						CoverTitle($$renderer, {
							href: `${base}/project-${page.params.region}-${projectId}/messaging/providers`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$provider', provider)?.name
									? $.store_get($$store_subs ??= {}, '$provider', provider)?.name
									: '-')}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Id($$renderer, {
							value: $.store_get($$store_subs ??= {}, '$provider', provider)?.$id,
							event: 'provider',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$provider', provider)?.$id)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}