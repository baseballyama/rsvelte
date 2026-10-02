import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Cover, CoverTitle } from '$lib/layout';
import { Id, Tab, Tabs } from '$lib/components';
import { isTabSelected } from '$lib/helpers/load';
import { canWriteDatabases } from '$lib/stores/roles';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { useTerminology } from '$database/(entity)';
import { isSmallViewport } from '$lib/stores/viewport';

var root = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteDatabases = () => $.store_get(canWriteDatabases, '$canWriteDatabases', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
			disabled: !$canWriteDatabases()
		}
	].filter((tab) => !tab.disabled));

	const responsiveInlineStart = $.derived(() => $isSmallViewport() ? '0' : '-2.5rem');

	Cover($$anchor, {
		databasesMainScreen: true,
		children: ($$anchor, $$slotProps) => {
			Tabs($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => $.get(tabs), $.index, ($$anchor, tab) => {
						{
							let $0 = $.derived(() => isTabSelected($.get(tab), page.url.pathname, baseDatabasePath, $.get(tabs)));

							Tab($$anchor, {
								get href() {
									return $.get(tab).href;
								},

								get event() {
									return $.get(tab).event;
								},

								get selected() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(tab).title));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			header: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_1 = $.first_child(fragment_5);

				CoverTitle(node_1, {
					get href() {
						return baseDatabasesPath;
					},

					get style() {
						return `margin-inline-start: ${$.get(responsiveInlineStart) ?? ''};`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $.get(database)?.name));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => $.get(database)?.$id);

					Id(node_2, {
						get value() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, $.get(database)?.$id));
							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_5);
			}
		}
	});

	$.pop();
	$$cleanup();
}