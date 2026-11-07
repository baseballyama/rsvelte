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
	const path = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]', page.params));
	const collection = $.derived(() => page.data.collection);

	const tabs = $.derived(() => [
		{
			href: $.get(path),
			title: 'Documents',
			event: 'documents',
			hasChildren: true
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
					return $.get(collection);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(collection)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}