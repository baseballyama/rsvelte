import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Cover, CoverTitle } from '$lib/layout';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { canWriteDatabases } from '$lib/stores/roles';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { useTerminology } from '$database/(entity)';
import { isSmallViewport } from '$lib/stores/viewport';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const terminology = useTerminology(page);
		const baseDatabasePath = resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params);
		const database = $.derived(() => page.data.database);
		const baseDatabasesPath = resolveRoute('/(console)/project-[region]-[project]/databases', page.params);

		const tabs = $.derived(() => [
			{
				href: baseDatabasePath,
				title: terminology.entity.title.plural,
				event: terminology.entity.lower.plural,
				hasChildren: true
			},

			{
				href: withPath(baseDatabasePath, '/backups'),
				title: 'Backups',
				event: 'backups',
				hasChildren: true
			},

			{
				href: withPath(baseDatabasePath, '/settings'),
				event: 'settings',
				title: 'Settings',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteDatabases', canWriteDatabases)
			}
		].filter((tab) => !tab.disabled));

		const responsiveInlineStart = $.derived(() => $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? '0' : '-2.5rem');

		Cover($$renderer, {
			databasesMainScreen: true,
			children: ($$renderer) => {
				Tabs($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(tabs());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let tab = each_array[$$index];

							Tab($$renderer, {
								href: tab.href,
								event: tab.event,
								selected: isTabSelected(tab, page.url.pathname, baseDatabasePath, tabs()),
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
							href: baseDatabasesPath,
							style: `margin-inline-start: ${responsiveInlineStart()};`,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(database()?.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Id($$renderer, {
							value: database()?.$id,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(database()?.$id)}`);
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