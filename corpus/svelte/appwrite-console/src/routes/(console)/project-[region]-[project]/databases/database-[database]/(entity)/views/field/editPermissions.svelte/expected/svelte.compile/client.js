import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Alert } from '@appwrite.io/pink-svelte';
import { Permissions } from '$lib/components/permissions';
import { addNotification } from '$lib/stores/notifications';
import { symmetricDifference } from '$lib/helpers/array';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { getTerminologies, toSupportiveRecord } from '$database/(entity)';

var root = $.from_html(` <b> </b>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p>A user requires appropriate permissions at either the <b> </b> or <b> </b> <a href="https://appwrite.io/docs/products/databases/permissions" target="_blank" rel="noopener noreferrer" class="link">Learn more about database permissions</a>.</p> <!>`, 1);

export default function EditPermissions($$anchor, $$props) {
	$.push($$props, true);

	let record = $.prop($$props, 'record', 11, null),
		arePermsDisabled = $.prop($$props, 'arePermsDisabled', 15, true);

	let permissions = $.state($.proxy(record().$permissions));
	let showPermissionAlert = $.state(true);
	const { analytics, dependencies, terminology, databaseSdk } = getTerminologies();
	const entityTerm = terminology.entity.lower.singular;
	const recordTerm = terminology.record.lower.singular;
	const entityTermTitle = terminology.entity.title.singular;
	const recordTermTitle = terminology.record.title.singular;

	function disableSubmit() {
		return arePermsDisabled();
	}

	async function updatePermissions() {
		try {
			const { $databaseId: databaseId, $id: recordId, entityId } = toSupportiveRecord(record());

			await databaseSdk.updateRecordPermissions({
				databaseId,
				entityId,
				recordId,
				permissions: $.get(permissions)
			});

			// TODO: @itznotabug, make suer this doesn't trigger or lose spreadsheet scroll state!
			await invalidate(dependencies.record.singular);

			arePermsDisabled(true);
			addNotification({ message: 'Permissions have been updated', type: 'success' });
			trackEvent(analytics.submit.record('UpdatePermissions'));
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, analytics.submit.record('UpdatePermissions'));
		}
	}

	$.user_effect(() => {
		if ($.get(permissions)) {
			arePermsDisabled(!symmetricDifference($.get(permissions), record().$permissions).length);
		}
	});

	var $$exports = { disableSubmit, updatePermissions };
	var fragment = root_2();
	var p = $.first_child(fragment);
	var b = $.sibling($.child(p));
	var text = $.only_child(b);
	var b_1 = $.sibling(b, 2);
	var text_1 = $.only_child(b_1);
	var text_2 = $.sibling(b_1);

	$.next(2);
	$.reset(p);

	var node = $.sibling(p, 2);

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
							get title() {
								return `${recordTermTitle ?? ''} security is enabled`;
							},
							dismissible: true,
							$$events: { dismiss: () => $.set(showPermissionAlert, false) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_3 = root();
								var text_3 = $.first_child(fragment_3);
								var b_2 = $.sibling(text_3);
								var text_4 = $.only_child(b_2);

								$.template_effect(() => {
									$.set_text(text_3, `Users will be able to access this ${recordTerm ?? ''} if they have been granted `);
									$.set_text(text_4, `either ${recordTerm ?? ''} or ${entityTerm ?? ''} permissions.`);
								});

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
					get title() {
						return `${recordTermTitle ?? ''} security is disabled`;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, `If you want to assign ${recordTerm ?? ''} permissions. Go to ${entityTermTitle ?? ''} settings and enable ${recordTerm ?? ''}
        security. Otherwise, only ${entityTerm ?? ''} permissions will be used.`));

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		};

		$.if(node, ($$render) => {
			if ($$props.entity.recordSecurity) $$render(consequent_2); else $$render(alternate, -1);
		});
	}

	$.template_effect(() => {
		$.set_text(text, `${entityTerm ?? ''} level`);
		$.set_text(text_1, `${recordTerm ?? ''} level`);

		$.set_text(text_2, ` to access a ${recordTerm ?? ''}. If no permissions are configured, no user
    can access the ${recordTerm ?? ''} `);
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}