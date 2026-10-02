import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { canWriteTables } from '$lib/stores/roles';
import { resolveRoute } from '$lib/stores/navigation';
import { Header } from '$database/(entity)';

export default function Header_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const path = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]/table-[table]', page.params));
		const table = $.derived(() => page.data.table);

		const tabs = $.derived(() => [
			{
				href: path(),
				title: 'Rows',
				event: 'rows',
				hasChildren: true
			},

			{
				href: `${path()}/columns`,
				title: 'Columns',
				event: 'columns'
			},

			{
				href: `${path()}/indexes`,
				title: 'Indexes',
				event: 'indexes'
			},

			{
				href: `${path()}/settings`,
				title: 'Settings',
				event: 'settings',
				disabled: !$.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables)
			}
		].filter((tab) => !tab.disabled));

		if (table()) {
			$$renderer.push('<!--[0-->');
			Header($$renderer, { tabs: tabs(), entity: table() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}