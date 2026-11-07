import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Alert } from '@appwrite.io/pink-svelte';
import { Permissions } from '$lib/components/permissions';
import { addNotification } from '$lib/stores/notifications';
import { symmetricDifference } from '$lib/helpers/array';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { getTerminologies, toSupportiveRecord } from '$database/(entity)';

export default function EditPermissions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { entity, record = null, arePermsDisabled = true } = $$props;
		let permissions = record.$permissions;
		let showPermissionAlert = true;
		const { analytics, dependencies, terminology, databaseSdk } = getTerminologies();
		const entityTerm = terminology.entity.lower.singular;
		const recordTerm = terminology.record.lower.singular;
		const entityTermTitle = terminology.entity.title.singular;
		const recordTermTitle = terminology.record.title.singular;

		function disableSubmit() {
			return arePermsDisabled;
		}

		async function updatePermissions() {
			try {
				const { $databaseId: databaseId, $id: recordId, entityId } = toSupportiveRecord(record);

				await databaseSdk.updateRecordPermissions({ databaseId, entityId, recordId, permissions });

				// TODO: @itznotabug, make suer this doesn't trigger or lose spreadsheet scroll state!
				await invalidate(dependencies.record.singular);

				arePermsDisabled = true;
				addNotification({ message: 'Permissions have been updated', type: 'success' });
				trackEvent(analytics.submit.record('UpdatePermissions'));
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, analytics.submit.record('UpdatePermissions'));
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<p>A user requires appropriate permissions at either the <b>${$.escape(entityTerm)} level</b> or <b>${$.escape(recordTerm)} level</b> to access a ${$.escape(recordTerm)}. If no permissions are configured, no user
    can access the ${$.escape(recordTerm)} <a href="https://appwrite.io/docs/products/databases/permissions" target="_blank" rel="noopener noreferrer" class="link">Learn more about database permissions</a>.</p> `);

			if (entity.recordSecurity) {
				$$renderer.push('<!--[0-->');

				if (showPermissionAlert) {
					$$renderer.push('<!--[0-->');

					if (Alert.Inline) {
						$$renderer.push('<!--[-->');

						Alert.Inline($$renderer, {
							status: 'info',
							title: `${$.stringify(recordTermTitle)} security is enabled`,
							dismissible: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Users will be able to access this ${$.escape(recordTerm)} if they have been granted <b>either ${$.escape(recordTerm)} or ${$.escape(entityTerm)} permissions.</b>`);
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
						title: `${$.stringify(recordTermTitle)} security is disabled`,
						children: ($$renderer) => {
							$$renderer.push(`<!---->If you want to assign ${$.escape(recordTerm)} permissions. Go to ${$.escape(entityTermTitle)} settings and enable ${$.escape(recordTerm)}
        security. Otherwise, only ${$.escape(entityTerm)} permissions will be used.`);
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
		$.bind_props($$props, { record, arePermsDisabled, disableSubmit, updatePermissions });
	});
}