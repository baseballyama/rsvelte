import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { canWriteTables } from '$lib/stores/roles';
import { resolveRoute } from '$lib/stores/navigation';
import { Header } from '$database/(entity)';

export default function Header_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const path = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]', page.params));
		const collection = $.derived(() => page.data.collection);

		const tabs = $.derived(() => [
			{
				href: path(),
				title: 'Documents',
				event: 'documents',
				hasChildren: true
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

		if (collection()) {
			$$renderer.push('<!--[0-->');
			Header($$renderer, { tabs: tabs(), entity: collection() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}