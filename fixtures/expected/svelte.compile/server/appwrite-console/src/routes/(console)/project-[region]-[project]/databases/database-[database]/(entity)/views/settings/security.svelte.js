import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { getTerminologies } from '$database/(entity)';

export default function Security($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { entity, onChangeSecurity } = $$props;
		let recordSecurity = entity.recordSecurity;
		const hasChanges = $.derived(() => recordSecurity !== entity.recordSecurity);

		async function cleanup() {
			// events and notif!
			trackEvent(analytics.submit.entity('UpdateSecurity'));

			addNotification({ message: `${entity.name} has been updated`, type: 'success' });

			// invalidate proper dependency.
			await invalidate(dependencies.entity.singular);
		}

		async function updateSecurity() {
			try {
				await onChangeSecurity(recordSecurity);
				await cleanup();
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, analytics.submit.entity('UpdateSecurity'));
			}
		}

		const { analytics, dependencies, terminology } = getTerminologies();
		const title = terminology.record.title.singular;
		const recordLower = terminology.record.lower.singular;
		const recordsLower = terminology.record.lower.plural;
		const entityLower = terminology.entity.lower.singular;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				$$slots: {
					title: ($$renderer) => {
						{
							$$renderer.push(`${$.escape(title)} security`);
						}
					},

					aside: ($$renderer) => {
						{
							InputSwitch($$renderer, {
								id: 'security',
								label: `${$.stringify(title)} security`,
								get value() {
									return recordSecurity;
								},

								set value($$value) {
									recordSecurity = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> <p class="text">When ${$.escape(recordLower)} security is enabled, users will be able to access ${$.escape(recordsLower)}
            for which they have been granted <b>either ${$.escape(recordLower)} or ${$.escape(entityLower)} permissions</b>.</p> <p class="text">If ${$.escape(recordLower)} security is disabled, users can access ${$.escape(recordsLower)} <b>only if they have ${$.escape(entityLower)} permissions</b>. ${$.escape(title)} permissions will be ignored.</p>`);
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								disabled: !hasChanges(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}