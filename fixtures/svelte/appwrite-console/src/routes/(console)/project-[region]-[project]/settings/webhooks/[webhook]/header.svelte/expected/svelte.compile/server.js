import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id } from '$lib/components';
import { Cover, CoverTitle } from '$lib/layout';
import { webhook } from './store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;

		Cover($$renderer, {
			$$slots: {
				header: ($$renderer) => {
					{
						CoverTitle($$renderer, {
							href: `${base}/project-${page.params.region}-${projectId}/settings/webhooks`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$webhook', webhook)?.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Id($$renderer, {
							value: $.store_get($$store_subs ??= {}, '$webhook', webhook)?.$id,
							event: 'webhook',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$webhook', webhook)?.$id)}`);
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