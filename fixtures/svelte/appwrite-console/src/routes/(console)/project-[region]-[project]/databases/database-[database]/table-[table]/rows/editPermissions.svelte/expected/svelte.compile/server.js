import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { Alert } from '@appwrite.io/pink-svelte';
import { Permissions } from '$lib/components/permissions';
import { addNotification } from '$lib/stores/notifications';
import { symmetricDifference } from '$lib/helpers/array';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { onMount } from 'svelte';

export default function EditPermissions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { table, row = null, arePermsDisabled = true } = $$props;
		let showPermissionAlert = true;
		let permissions = row.$permissions;

		onMount(() => {
			/* silences the not read error warning */
			arePermsDisabled;
		});

		async function updatePermissions() {
			try {
				const { $databaseId: databaseId, $tableId: tableId, $id: rowId } = row;

				await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({ databaseId, tableId, rowId, permissions });
				await invalidate(Dependencies.ROW);
				arePermsDisabled = true;
				addNotification({ message: 'Permissions have been updated', type: 'success' });
				trackEvent(Submit.RowUpdatePermissions);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.RowUpdatePermissions);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<p>A user requires appropriate permissions at either the <b>table level</b> or <b>row level</b> to access a row. If no permissions are configured, no user can access the row <a href="https://appwrite.io/docs/products/databases/permissions" target="_blank" rel="noopener noreferrer" class="link">Learn more about database permissions</a>.</p> `);

			if (table.recordSecurity) {
				$$renderer.push('<!--[0-->');

				if (showPermissionAlert) {
					$$renderer.push('<!--[0-->');

					if (Alert.Inline) {
						$$renderer.push('<!--[-->');

						Alert.Inline($$renderer, {
							status: 'info',
							title: 'Row security is enabled',
							dismissible: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Users will be able to access this row if they have been granted <b>either row or table permissions.</b>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (permissions) {
					$$renderer.push('<!--[0-->');

					Permissions($$renderer, {
						get permissions() {
							return permissions;
						},

						set permissions($$value) {
							permissions = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');

				if (Alert.Inline) {
					$$renderer.push('<!--[-->');

					Alert.Inline($$renderer, {
						status: 'info',
						title: 'Row security is disabled',
						children: ($$renderer) => {
							$$renderer.push(`<!---->If you want to assign row permissions. Go to Table settings and enable row security.
        Otherwise, only table permissions will be used.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { row, arePermsDisabled, updatePermissions });
	});
}