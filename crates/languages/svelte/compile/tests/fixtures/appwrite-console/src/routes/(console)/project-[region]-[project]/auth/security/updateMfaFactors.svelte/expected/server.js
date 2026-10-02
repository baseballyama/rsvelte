import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { canWriteProjects } from '$lib/stores/roles';
import { sdk } from '$lib/stores/sdk';
import { Selector } from '@appwrite.io/pink-svelte';

export default function UpdateMfaFactors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { project, policy } = $$props;
		let totp = policy.totp;
		let email = policy.email;
		let phone = policy.phone;
		let custom = policy.custom;
		const isSubmitDisabled = $.derived(() => totp === policy.totp && email === policy.email && phone === policy.phone && custom === policy.custom);

		async function updateMfaFactors() {
			try {
				await sdk.forProject(project.region, project.$id).project.updateMFAFactorsPolicy({ totp, email, phone, custom });
				await invalidate(Dependencies.PROJECT);
				addNotification({ type: 'success', message: 'Updated MFA factors' });
				trackEvent(Submit.AuthMfaFactorsUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthMfaFactorsUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateMfaFactors,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Choose which factors your users can use to complete a multi-factor authentication challenge. Recovery
        codes always remain available as a fallback.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`MFA factors`);
								}
							},

							aside: ($$renderer) => {
								{
									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'mfaFactorTotp',
											label: 'TOTP',
											description: 'Time-based codes from an authenticator app',
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get checked() {
												return totp;
											},

											set checked($$value) {
												totp = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'mfaFactorEmail',
											label: 'Email',
											description: 'Codes sent to the user\'s verified email address',
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get checked() {
												return email;
											},

											set checked($$value) {
												email = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'mfaFactorPhone',
											label: 'Phone',
											description: 'Codes sent to the user\'s verified phone number over SMS',
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get checked() {
												return phone;
											},

											set checked($$value) {
												phone = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'mfaFactorCustom',
											label: 'Custom',
											description: 'Appwrite generates and verifies the code, and you deliver it through your own channel',
											disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
											get checked() {
												return custom;
											},

											set checked($$value) {
												custom = $$value;
												$$settled = false;
											}
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
										disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || isSubmitDisabled(),
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}