import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover, CoverTitle } from '$lib/layout';
import { canWriteBuckets } from '$lib/stores/roles';
import { bucket } from './store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		const bucketId = page.params.bucket;
		const path = `${base}/project-${page.params.region}-${projectId}/storage/bucket-${bucketId}`;

		const tabs = [
			{
				href: path,
				title: 'Files',
				event: 'files',
				hasChildren: true
			},

			{
				href: `${path}/settings`,
				event: 'settings',
				title: 'Settings',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteBuckets', canWriteBuckets)
			}
		].filter((tab) => !tab.disabled);

		Cover($$renderer, {
			children: ($$renderer) => {
				Tabs($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(tabs);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tab = each_array[$$index];

							Tab($$renderer, {
								href: tab.href,
								selected: isTabSelected(tab, page.url.pathname, path, tabs),
								event: tab.event,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(tab.title)}`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},

			$$slots: {
				default: true,
				header: ($$renderer) => {
					{
						CoverTitle($$renderer, {
							href: `${base}/project-${page.params.region}-${projectId}/storage`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$bucket', bucket)?.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if ($.store_get($$store_subs ??= {}, '$bucket', bucket)?.$id) {
							$$renderer.push('<!--[0-->');

							Id($$renderer, {
								value: $.store_get($$store_subs ??= {}, '$bucket', bucket).$id,
								event: 'bucket',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$bucket', bucket).$id)}`);
								},
								$$slots: { default: true }
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}