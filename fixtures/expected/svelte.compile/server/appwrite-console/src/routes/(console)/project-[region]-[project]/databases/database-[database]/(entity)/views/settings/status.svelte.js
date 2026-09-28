import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { CardGrid } from '$lib/components';
import { toLocaleDateTime } from '$lib/helpers/date';
import { Button, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { trackEvent, trackError } from '$lib/actions/analytics';
import { getTerminologies } from '$database/(entity)';

export default function Status($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { entity, onChangeStatus } = $$props;
		let enabled = entity.enabled;
		const { analytics, dependencies } = getTerminologies();

		async function cleanup() {
			// events and notif!
			trackEvent(analytics.submit.entity('UpdateEnabled'));

			addNotification({ message: `${entity.name} has been updated`, type: 'success' });

			// invalidate proper dependency.
			await invalidate(dependencies.entity.singular);
		}

		async function updateStatus() {
			try {
				await onChangeStatus(enabled);
				await cleanup();
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, analytics.submit.entity('UpdateEnabled'));
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				$$slots: {
					title: ($$renderer) => {
						{
							$$renderer.push(`${$.escape(entity.name)}`);
						}
					},

					aside: ($$renderer) => {
						{
							$$renderer.push(`<ul>`);

							InputSwitch($$renderer, {
								id: 'toggle',
								label: enabled ? 'Enabled' : 'Disabled',
								get value() {
									return enabled;
								},

								set value($$value) {
									enabled = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></ul> <div><p>Created: ${$.escape(toLocaleDateTime(entity.$createdAt))}</p> <p>Last updated: ${$.escape(toLocaleDateTime(entity.$updatedAt))}</p></div>`);
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								disabled: enabled === entity.enabled,
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