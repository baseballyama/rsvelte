import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { Cover, CoverTitle } from '$lib/layout';
import { team } from './store';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const path = `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${page.params.team}`;

		const tabs = [
			{ href: path, title: 'Overview', event: 'overview' },
			{
				href: `${path}/members`,
				title: 'Members',
				event: 'members',
				hasChildren: true
			}
		];

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
							href: `${base}/project-${page.params.region}-${page.params.project}/auth/teams`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$team', team)?.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Id($$renderer, {
							value: $.store_get($$store_subs ??= {}, '$team', team)?.$id,
							event: 'team',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$team', team)?.$id)}`);
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