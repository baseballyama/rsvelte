import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Container } from '$lib/layout';

import {
	DangerZone,
	UpdateName,
	UpdatePermissions,
	UpdateSecurity,
	UpdateStatus,
	toDatabaseType,
	useDatabaseSdk
} from '$database/(entity)';

import DisplayName from './displayName.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="wide-screen-wrapper databases-spreadsheet"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/* served from parent layout */
	const collection = $.derived(() => $$props.data.collection);

	const databaseSdk = useDatabaseSdk(page.params.region, page.params.project, toDatabaseType($$props.data.database.type));

	const entityParams = $.derived(() => ({
		databaseId: page.params.database,
		entityId: page.params.collection
	}));

	async function deleteCollection() {
		await databaseSdk.deleteEntity($.get(entityParams));
	}

	async function updateCollection(updates) {
		await databaseSdk.updateEntity({
			...$.get(entityParams),
			name: $.get(collection).name,
			...updates
		});
	}

	var div = root_1();
	var node = $.child(div);

	Container(node, {
		expanded: true,
		slotSpacing: true,
		databasesScreen: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			UpdateStatus(node_1, {
				get entity() {
					return $.get(collection);
				},
				onChangeStatus: (enabled) => updateCollection({ enabled })
			});

			var node_2 = $.sibling(node_1, 2);

			UpdateName(node_2, {
				get entity() {
					return $.get(collection);
				},
				onChangeName: (name) => updateCollection({ name })
			});

			var node_3 = $.sibling(node_2, 2);

			DisplayName(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			UpdatePermissions(node_4, {
				get entity() {
					return $.get(collection);
				},
				onChangePermissions: (permissions) => updateCollection({ permissions })
			});

			var node_5 = $.sibling(node_4, 2);

			UpdateSecurity(node_5, {
				get entity() {
					return $.get(collection);
				},
				onChangeSecurity: (documentSecurity) => updateCollection({ documentSecurity })
			});

			var node_6 = $.sibling(node_5, 2);

			DangerZone(node_6, {
				get entity() {
					return $.get(collection);
				},
				onDelete: deleteCollection
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}