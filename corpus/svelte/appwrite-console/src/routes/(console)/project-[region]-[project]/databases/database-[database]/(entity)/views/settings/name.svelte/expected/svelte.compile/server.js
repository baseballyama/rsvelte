import * as $ from 'svelte/internal/server';
import { trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { subNavigation } from '$lib/stores/database';
import { getTerminologies } from '$database/(entity)';
import { invalidate } from '$app/navigation';

export default function Name($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { entity, onChangeName } = $$props;
		let entityName = entity.name;
		const { analytics, dependencies } = getTerminologies();

		async function cleanup() {
			subNavigation.update(); // update the side entity table.

			// events and notif!
			trackEvent(analytics.submit.entity('UpdateName'));

			addNotification({ message: 'Name has been updated', type: 'success' });

			// invalidate proper dependency.
			await invalidate(dependencies.entity.singular);
		}

		async function updateName() {
			try {
				await onChangeName(entityName);
				await cleanup();
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, analytics.submit.entity('UpdateName'));
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Name`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										required: true,
										id: 'name',
										label: 'Name',
										placeholder: 'Enter name',
										autocomplete: false,
										get value() {
											return entityName;
										},

										set value($$value) {
											entityName = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: entityName === entity.name || !entityName,
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
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