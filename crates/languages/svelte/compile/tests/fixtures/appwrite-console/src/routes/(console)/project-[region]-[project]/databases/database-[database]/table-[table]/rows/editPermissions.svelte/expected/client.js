import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Users will be able to access this row if they have been granted <b>either row or table permissions.</b>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p>A user requires appropriate permissions at either the <b>table level</b> or <b>row level</b> to access a row. If no permissions are configured, no user can access the row <a href="https://appwrite.io/docs/products/databases/permissions" target="_blank" rel="noopener noreferrer" class="link">Learn more about database permissions</a>.</p> <!>`, 1);

export default function EditPermissions($$anchor, $$props) {
	$.push($$props, true);

	let row = $.prop($$props, 'row', 11, null),
		arePermsDisabled = $.prop($$props, 'arePermsDisabled', 15, true);

	let showPermissionAlert = $.state(true);
	let permissions = $.state($.proxy(row().$permissions));

	onMount(() => {
		/* silences the not read error warning */
		arePermsDisabled();
	});

	async function updatePermissions() {
		try {
			const { $databaseId: databaseId, $tableId: tableId, $id: rowId } = row();

			await sdk.forProject(page.params.region, page.params.project).tablesDB.updateRow({ databaseId, tableId, rowId, permissions: $.get(permissions) });
			await invalidate(Dependencies.ROW);
			arePermsDisabled(true);
			addNotification({ message: 'Permissions have been updated', type: 'success' });
			trackEvent(Submit.RowUpdatePermissions);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.RowUpdatePermissions);
		}
	}

	$.user_effect(() => {
		if ($.get(permissions)) {
			arePermsDisabled(!symmetricDifference($.get(permissions), row().$permissions).length);
		}
	});

	var $$exports = { updatePermissions };
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
						Alert_Inline($$anchor, {
							status: 'info',
							title: 'Row security is enabled',
							dismissible: true,
							$$events: { dismiss: () => $.set(showPermissionAlert, false) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_3 = root();

								$.next();
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(showPermissionAlert)) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					Permissions($$anchor, {
						get permissions() {
							return $.get(permissions);
						},

						set permissions($$value) {
							$.set(permissions, $$value, true);
						}
					});
				};

				$.if(node_3, ($$render) => {
					if ($.get(permissions)) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			$.component(node_4, () => Alert.Inline, ($$anchor, Alert_Inline_1) => {
				Alert_Inline_1($$anchor, {
					status: 'info',
					title: 'Row security is disabled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('If you want to assign row permissions. Go to Table settings and enable row security.\n        Otherwise, only table permissions will be used.');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if ($$props.table.recordSecurity) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}