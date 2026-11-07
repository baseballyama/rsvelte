import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import { Container } from '$lib/layout';
import DisplayName from './displayName.svelte';

import {
	DangerZone,
	UpdateName,
	UpdatePermissions,
	UpdateSecurity,
	UpdateStatus
} from '$database/(entity)';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="wide-screen-wrapper databases-spreadsheet"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	/* served from parent layout */
	const table = $.derived(() => $$props.data.table);

	const params = $.derived(() => {
		return {
			name: $.get(table).name,
			tableId: page.params.table,
			databaseId: page.params.database,
			rowSecurity: $.get(table).recordSecurity,
			enabled: $.get(table).enabled,
			permissions: $.get(table).$permissions
		};
	});

	async function deleteTable() {
		await sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({ ...$.get(params) });
	}

	async function updateTable(updates) {
		await sdk.forProject(page.params.region, page.params.project).tablesDB.updateTable({ ...$.get(params), ...updates });
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
					return $.get(table);
				},
				onChangeStatus: (enabled) => updateTable({ enabled })
			});

			var node_2 = $.sibling(node_1, 2);

			UpdateName(node_2, {
				get entity() {
					return $.get(table);
				},
				onChangeName: (name) => updateTable({ name })
			});

			var node_3 = $.sibling(node_2, 2);

			DisplayName(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			UpdatePermissions(node_4, {
				get entity() {
					return $.get(table);
				},
				onChangePermissions: (permissions) => updateTable({ permissions })
			});

			var node_5 = $.sibling(node_4, 2);

			UpdateSecurity(node_5, {
				get entity() {
					return $.get(table);
				},
				onChangeSecurity: (rowSecurity) => updateTable({ rowSecurity })
			});

			var node_6 = $.sibling(node_5, 2);

			DangerZone(node_6, {
				get entity() {
					return $.get(table);
				},
				onDelete: deleteTable
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}