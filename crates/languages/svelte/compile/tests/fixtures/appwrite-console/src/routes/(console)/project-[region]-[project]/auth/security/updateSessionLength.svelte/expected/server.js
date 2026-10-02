import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
import { createTimeUnitPair } from '$lib/helpers/unit';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Layout } from '@appwrite.io/pink-svelte';

export default function UpdateSessionLength($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { project, policy } = $$props;

		const $$d = $.derived(() => createTimeUnitPair(policy.duration)),
			value = $.derived(() => $$d().value),
			unit = $.derived(() => $$d().unit),
			baseValue = $.derived(() => $$d().baseValue),
			units = $.derived(() => $$d().units);

		const options = $.derived(() => units().map((v) => ({ label: v.name, value: v.name })));

		async function updateSessionLength() {
			try {
				await sdk.forProject(project.region, project.$id).project.updateSessionDurationPolicy({
					duration: $.store_get($$store_subs ??= {}, '$baseValue', baseValue())
				});

				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: 'Updated project users limit successfully'
				});

				trackEvent(Submit.SessionsLengthUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.SessionsLengthUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->If you reduce the limit, users who are currently logged in will be logged out of the application.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Session length`);
						}
					},

					aside: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									children: ($$renderer) => {
										InputNumber($$renderer, {
											required: true,
											id: 'length',
											label: 'Length',
											min: 0,
											get value() {
												return $.store_get($$store_subs ??= {}, '$value', value());
											},

											set value($$value) {
												$.store_set(value, $$value);
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputSelect($$renderer, {
											required: true,
											id: 'period',
											label: 'Time period',
											options: options(),
											get value() {
												return $.store_get($$store_subs ??= {}, '$unit', unit());
											},

											set value($$value) {
												$.store_set(unit, $$value);
												$$settled = false;
											}
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								disabled: $.store_get($$store_subs ??= {}, '$baseValue', baseValue()) === policy.duration,
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}