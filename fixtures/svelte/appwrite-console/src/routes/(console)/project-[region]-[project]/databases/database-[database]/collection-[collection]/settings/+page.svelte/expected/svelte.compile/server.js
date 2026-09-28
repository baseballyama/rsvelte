import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/* served from parent layout */
		const { data } = $$props;

		const collection = $.derived(() => data.collection);
		const databaseSdk = useDatabaseSdk(page.params.region, page.params.project, toDatabaseType(data.database.type));

		const entityParams = $.derived(() => ({
			databaseId: page.params.database,
			entityId: page.params.collection
		}));

		async function deleteCollection() {
			await databaseSdk.deleteEntity(entityParams());
		}

		async function updateCollection(updates) {
			await databaseSdk.updateEntity({ ...entityParams(), name: collection().name, ...updates });
		}

		$$renderer.push(`<div class="wide-screen-wrapper databases-spreadsheet">`);

		Container($$renderer, {
			expanded: true,
			slotSpacing: true,
			databasesScreen: true,
			children: ($$renderer) => {
				UpdateStatus($$renderer, {
					entity: collection(),
					onChangeStatus: (enabled) => updateCollection({ enabled })
				});

				$$renderer.push(`<!----> `);

				UpdateName($$renderer, {
					entity: collection(),
					onChangeName: (name) => updateCollection({ name })
				});

				$$renderer.push(`<!----> `);
				DisplayName($$renderer, {});
				$$renderer.push(`<!----> `);

				UpdatePermissions($$renderer, {
					entity: collection(),
					onChangePermissions: (permissions) => updateCollection({ permissions })
				});

				$$renderer.push(`<!----> `);

				UpdateSecurity($$renderer, {
					entity: collection(),
					onChangeSecurity: (documentSecurity) => updateCollection({ documentSecurity })
				});

				$$renderer.push(`<!----> `);
				DangerZone($$renderer, { entity: collection(), onDelete: deleteCollection });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}