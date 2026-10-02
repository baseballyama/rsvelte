import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';

export default function SessionSecurity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { project, sessionAlertPolicy, sessionInvalidationPolicy } = $$props;
		let authSessionAlerts = false;
		let sessionInvalidation = false;

		onMount(() => {
			authSessionAlerts = sessionAlertPolicy.enabled;
			sessionInvalidation = sessionInvalidationPolicy.enabled;
		});

		const hasChanges = $.derived(() => {
			const alertsChanged = authSessionAlerts !== sessionAlertPolicy.enabled;
			const invalidationChanged = sessionInvalidation !== sessionInvalidationPolicy.enabled;

			return alertsChanged || invalidationChanged;
		});

		async function updateSessionSecurity() {
			try {
				const projectSdk = sdk.forProject(project.region, project.$id).project;

				await projectSdk.updateSessionAlertPolicy({ enabled: authSessionAlerts });
				await projectSdk.updateSessionInvalidationPolicy({ enabled: sessionInvalidation });
				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: 'Updated session security settings.'
				});

				trackEvent(Submit.AuthSessionAlertsUpdate);
				trackEvent(Submit.AuthInvalidateSession);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthSessionAlertsUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateSessionSecurity,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						gap: 'xxl',
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Session security`);
								}
							},

							aside: ($$renderer) => {
								{
									InputSwitch($$renderer, {
										id: 'authSessionAlerts',
										label: 'Session alerts',
										get value() {
											return authSessionAlerts;
										},

										set value($$value) {
											authSessionAlerts = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Enabling this option will send an email to the users when a new session is
                        created.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											}
										}
									});

									$$renderer.push(`<!----> `);

									InputSwitch($$renderer, {
										id: 'invalidateSessions',
										label: 'Invalidate sessions',
										get value() {
											return sessionInvalidation;
										},

										set value($$value) {
											sessionInvalidation = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Enabling this option will clear all existing sessions when the user changes
                        their password.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}
											}
										}
									});

									$$renderer.push(`<!---->`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: !hasChanges(),
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