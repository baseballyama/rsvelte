import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputNumber } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Typography } from '@appwrite.io/pink-svelte';

export default function UpdateSessionsLimit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { project, policy } = $$props;
		let maxSessions = policy.total;

		async function updateSessionsLimit() {
			try {
				await sdk.forProject(project.region, project.$id).project.updateSessionLimitPolicy({ total: maxSessions });
				await invalidate(Dependencies.PROJECT);
				addNotification({ type: 'success', message: 'Sessions limit has been updated' });
				trackEvent(Submit.SessionsLimitUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.SessionsLimitUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateSessionsLimit,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Maximum number of active sessions allowed per user`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Sessions limit`);
								}
							},

							aside: ($$renderer) => {
								{
									InputNumber($$renderer, {
										required: true,
										min: 1,
										max: 100,
										id: 'max-session',
										label: 'Limit',
										get value() {
											return maxSessions;
										},

										set value($$value) {
											maxSessions = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: maxSessions === policy.total,
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