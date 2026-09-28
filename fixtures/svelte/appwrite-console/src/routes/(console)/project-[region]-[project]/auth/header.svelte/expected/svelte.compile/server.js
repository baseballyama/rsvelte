import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover } from '$lib/layout';
import { canWriteProjects } from '$lib/stores/roles';
import { Typography } from '@appwrite.io/pink-svelte';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const path = `${base}/project-${page.params.region}-${page.params.project}/auth`;

		const tabs = [
			{
				href: path,
				title: 'Users',
				hasChildren: true,
				event: 'users'
			},

			{
				href: `${path}/teams`,
				title: 'Teams',
				hasChildren: true,
				event: 'teams'
			},

			{
				href: `${path}/security`,
				title: 'Security',
				event: 'security',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects)
			},

			{
				href: `${path}/templates`,
				title: 'Templates',
				hasChildren: false,
				event: 'templates',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects)
			},

			{
				href: `${path}/settings`,
				title: 'Settings',
				event: 'settings',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects)
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
								event: tab.event,
								selected: isTabSelected(tab, page.url.pathname, path, tabs),
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
						if (Typography.Title) {
							$$renderer.push('<!--[-->');

							Typography.Title($$renderer, {
								color: '--fgcolor-neutral-primary',
								size: 'xl',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Auth`);
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
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}