import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { canWriteProjects } from '$lib/stores/roles';
import { sdk } from '$lib/stores/sdk';
import { Selector } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function UpdateMfaFactors($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let totp = $.state($.proxy($$props.policy.totp));
	let email = $.state($.proxy($$props.policy.email));
	let phone = $.state($.proxy($$props.policy.phone));
	let custom = $.state($.proxy($$props.policy.custom));
	const isSubmitDisabled = $.derived(() => $.get(totp) === $$props.policy.totp && $.get(email) === $$props.policy.email && $.get(phone) === $$props.policy.phone && $.get(custom) === $$props.policy.custom);

	async function updateMfaFactors() {
		try {
			await sdk.forProject($$props.project.region, $$props.project.$id).project.updateMFAFactorsPolicy({
				totp: $.get(totp),
				email: $.get(email),
				phone: $.get(phone),
				custom: $.get(custom)
			});

			await invalidate(Dependencies.PROJECT);
			addNotification({ type: 'success', message: 'Updated MFA factors' });
			trackEvent(Submit.AuthMfaFactorsUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.AuthMfaFactorsUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updateMfaFactors,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Choose which factors your users can use to complete a multi-factor authentication challenge. Recovery\n        codes always remain available as a fallback.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('MFA factors');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => !$canWriteProjects());

							$.component(node, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
								Selector_Checkbox($$anchor, {
									id: 'mfaFactorTotp',
									label: 'TOTP',
									description: 'Time-based codes from an authenticator app',
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return $.get(totp);
									},

									set checked($$value) {
										$.set(totp, $$value, true);
									}
								});
							});
						}

						var node_1 = $.sibling(node, 2);

						{
							let $0 = $.derived(() => !$canWriteProjects());

							$.component(node_1, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_1) => {
								Selector_Checkbox_1($$anchor, {
									id: 'mfaFactorEmail',
									label: 'Email',
									description: 'Codes sent to the user\'s verified email address',
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return $.get(email);
									},

									set checked($$value) {
										$.set(email, $$value, true);
									}
								});
							});
						}

						var node_2 = $.sibling(node_1, 2);

						{
							let $0 = $.derived(() => !$canWriteProjects());

							$.component(node_2, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_2) => {
								Selector_Checkbox_2($$anchor, {
									id: 'mfaFactorPhone',
									label: 'Phone',
									description: 'Codes sent to the user\'s verified phone number over SMS',
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return $.get(phone);
									},

									set checked($$value) {
										$.set(phone, $$value, true);
									}
								});
							});
						}

						var node_3 = $.sibling(node_2, 2);

						{
							let $0 = $.derived(() => !$canWriteProjects());

							$.component(node_3, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_3) => {
								Selector_Checkbox_3($$anchor, {
									id: 'mfaFactorCustom',
									label: 'Custom',
									description: 'Appwrite generates and verifies the code, and you deliver it through your own channel',
									get disabled() {
										return $.get($0);
									},

									get checked() {
										return $.get(custom);
									},

									set checked($$value) {
										$.set(custom, $$value, true);
									}
								});
							});
						}

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => !$canWriteProjects() || $.get(isSubmitDisabled));

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Update');

									$.append($$anchor, text_2);
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
	$$cleanup();
}