import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function SessionSecurity($$anchor, $$props) {
	$.push($$props, true);

	let authSessionAlerts = $.state(false);
	let sessionInvalidation = $.state(false);

	onMount(() => {
		$.set(authSessionAlerts, $$props.sessionAlertPolicy.enabled, true);
		$.set(sessionInvalidation, $$props.sessionInvalidationPolicy.enabled, true);
	});

	const hasChanges = $.derived(() => {
		const alertsChanged = $.get(authSessionAlerts) !== $$props.sessionAlertPolicy.enabled;
		const invalidationChanged = $.get(sessionInvalidation) !== $$props.sessionInvalidationPolicy.enabled;

		return alertsChanged || invalidationChanged;
	});

	async function updateSessionSecurity() {
		try {
			const projectSdk = sdk.forProject($$props.project.region, $$props.project.$id).project;

			await projectSdk.updateSessionAlertPolicy({ enabled: $.get(authSessionAlerts) });
			await projectSdk.updateSessionInvalidationPolicy({ enabled: $.get(sessionInvalidation) });
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

	Form($$anchor, {
		onSubmit: updateSessionSecurity,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				gap: 'xxl',
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Session security');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						InputSwitch(node, {
							id: 'authSessionAlerts',
							label: 'Session alerts',
							get value() {
								return $.get(authSessionAlerts);
							},

							set value($$value) {
								$.set(authSessionAlerts, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_1 = $.first_child(fragment_3);

									$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
										Typography_Text($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Enabling this option will send an email to the users when a new session is\n                        created.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								}
							}
						});

						var node_2 = $.sibling(node, 2);

						InputSwitch(node_2, {
							id: 'invalidateSessions',
							label: 'Invalidate sessions',
							get value() {
								return $.get(sessionInvalidation);
							},

							set value($$value) {
								$.set(sessionInvalidation, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text_1) => {
										Typography_Text_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Enabling this option will clear all existing sessions when the user changes\n                        their password.');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								}
							}
						});

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => !$.get(hasChanges));

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Update');

									$.append($$anchor, text_3);
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

	$.pop();
}