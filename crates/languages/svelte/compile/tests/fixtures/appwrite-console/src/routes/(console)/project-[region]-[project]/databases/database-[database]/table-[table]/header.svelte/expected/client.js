import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { canWriteTables } from '$lib/stores/roles';
import { resolveRoute } from '$lib/stores/navigation';
import { Header } from '$database/(entity)';

export default function Header_1($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const path = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]/table-[table]', page.params));
	const table = $.derived(() => page.data.table);

	const tabs = $.derived(() => [
		{
			href: $.get(path),
			title: 'Rows',
			event: 'rows',
			hasChildren: true
		},

		{
			href: `${$.get(path)}/columns`,
			title: 'Columns',
			event: 'columns'
		},

		{
			href: `${$.get(path)}/indexes`,
			title: 'Indexes',
			event: 'indexes'
		},

		{
			href: `${$.get(path)}/settings`,
			title: 'Settings',
			event: 'settings',
			disabled: !$canWriteTables()
		}
	].filter((tab) => !tab.disabled));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Header($$anchor, {
				get tabs() {
					return $.get(tabs);
				},

				get entity() {
					return $.get(table);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(table)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}