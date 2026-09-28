import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/* served from parent layout */
		const { data } = $$props;

		const table = $.derived(() => data.table);

		const params = $.derived(() => {
			return {
				name: table().name,
				tableId: page.params.table,
				databaseId: page.params.database,
				rowSecurity: table().recordSecurity,
				enabled: table().enabled,
				permissions: table().$permissions
			};
		});

		async function deleteTable() {
			await sdk.forProject(page.params.region, page.params.project).tablesDB.deleteTable({ ...params() });
		}

		async function updateTable(updates) {
			await sdk.forProject(page.params.region, page.params.project).tablesDB.updateTable({ ...params(), ...updates });
		}

		$$renderer.push(`<div class="wide-screen-wrapper databases-spreadsheet">`);

		Container($$renderer, {
			expanded: true,
			slotSpacing: true,
			databasesScreen: true,
			children: ($$renderer) => {
				UpdateStatus($$renderer, {
					entity: table(),
					onChangeStatus: (enabled) => updateTable({ enabled })
				});

				$$renderer.push(`<!----> `);

				UpdateName($$renderer, {
					entity: table(),
					onChangeName: (name) => updateTable({ name })
				});

				$$renderer.push(`<!----> `);
				DisplayName($$renderer, {});
				$$renderer.push(`<!----> `);

				UpdatePermissions($$renderer, {
					entity: table(),
					onChangePermissions: (permissions) => updateTable({ permissions })
				});

				$$renderer.push(`<!----> `);

				UpdateSecurity($$renderer, {
					entity: table(),
					onChangeSecurity: (rowSecurity) => updateTable({ rowSecurity })
				});

				$$renderer.push(`<!----> `);
				DangerZone($$renderer, { entity: table(), onDelete: deleteTable });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}