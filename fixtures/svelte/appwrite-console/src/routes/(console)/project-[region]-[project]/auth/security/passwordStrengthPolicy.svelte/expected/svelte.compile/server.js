import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputCheckbox, InputNumber } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';

export default function PasswordStrengthPolicy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { project, policy } = $$props;
		const getInitial = () => policy;
		let passwordMinLength = getInitial().min;
		let passwordUppercase = getInitial().uppercase;
		let passwordLowercase = getInitial().lowercase;
		let passwordNumber = getInitial().number;
		let passwordSymbols = getInitial().symbols;
		const hasChanges = $.derived(() => Number(passwordMinLength) !== policy.min || passwordUppercase !== policy.uppercase || passwordLowercase !== policy.lowercase || passwordNumber !== policy.number || passwordSymbols !== policy.symbols);

		async function updatePasswordStrengthPolicy() {
			try {
				await sdk.forProject(project.region, project.$id).project.updatePasswordStrengthPolicy({
					min: passwordMinLength,
					uppercase: passwordUppercase,
					lowercase: passwordLowercase,
					number: passwordNumber,
					symbols: passwordSymbols
				});

				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: 'Updated password strength policy.'
				});

				trackEvent(Submit.AuthPasswordStrengthUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthPasswordStrengthUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updatePasswordStrengthPolicy,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						gap: 'xxl',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Set the minimum requirements users must meet when creating or changing a password.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Password strength`);
								}
							},

							aside: ($$renderer) => {
								{
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'm',
											children: ($$renderer) => {
												$$renderer.push(`<div class="password-strength-length svelte-a88ya4">`);

												InputNumber($$renderer, {
													required: true,
													max: 256,
													min: 8,
													label: 'Minimum length',
													id: 'password-strength-min',
													get value() {
														return passwordMinLength;
													},

													set value($$value) {
														passwordMinLength = $$value;
														$$settled = false;
													},

													$$slots: {
														info: ($$renderer) => {
															Tooltip($$renderer, {
																slot: 'info',
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconInfo, size: 's' });
																},

																$$slots: {
																	default: true,
																	tooltip: ($$renderer) => {
																		$$renderer.push(`<span slot="tooltip">Passwords must be between 8 and 256 characters.</span>`);
																	}
																}
															});
														}
													}
												});

												$$renderer.push(`<!----></div> `);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 's',
														children: ($$renderer) => {
															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	size: 'm',
																	weight: 'medium',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Character requirements`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` <div class="password-strength-requirements svelte-a88ya4">`);

															InputCheckbox($$renderer, {
																id: 'password-strength-uppercase',
																label: 'Uppercase letter',
																get checked() {
																	return passwordUppercase;
																},

																set checked($$value) {
																	passwordUppercase = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															InputCheckbox($$renderer, {
																id: 'password-strength-lowercase',
																label: 'Lowercase letter',
																get checked() {
																	return passwordLowercase;
																},

																set checked($$value) {
																	passwordLowercase = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															InputCheckbox($$renderer, {
																id: 'password-strength-number',
																label: 'Number',
																get checked() {
																	return passwordNumber;
																},

																set checked($$value) {
																	passwordNumber = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															InputCheckbox($$renderer, {
																id: 'password-strength-symbols',
																label: 'Special character',
																get checked() {
																	return passwordSymbols;
																},

																set checked($$value) {
																	passwordSymbols = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----></div>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
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