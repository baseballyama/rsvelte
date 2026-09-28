import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover, CoverTitle } from '$lib/layout';
import { canWriteFunctions } from '$lib/stores/roles';
import { func } from './store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const projectId = page.params.project;
		const functionId = page.params.function;
		const path = `${base}/project-${page.params.region}-${projectId}/functions/function-${functionId}`;

		const tabs = [
			{
				href: path,
				title: 'Deployments',
				event: 'deployments',
				hasChildren: true
			},

			{
				href: `${path}/executions`,
				title: 'Executions',
				event: 'executions',
				hasChildren: true
			},
			{ href: `${path}/domains`, title: 'Domains', event: 'domains' },
			{
				href: `${path}/settings`,
				event: 'settings',
				title: 'Settings',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteFunctions', canWriteFunctions)
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
							href: `${base}/project-${page.params.region}-${projectId}/functions`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$func', func)?.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						if ($.store_get($$store_subs ??= {}, '$func', func)?.$id) {
							$$renderer.push('<!--[0-->');

							Id($$renderer, {
								value: $.store_get($$store_subs ??= {}, '$func', func).$id,
								event: 'function',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$func', func).$id)}`);
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