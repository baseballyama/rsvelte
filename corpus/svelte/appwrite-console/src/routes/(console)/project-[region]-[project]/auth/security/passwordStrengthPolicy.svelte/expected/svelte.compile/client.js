import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputCheckbox, InputNumber } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<span slot="tooltip">Passwords must be between 8 and 256 characters.</span>`);
var root_1 = $.from_html(`<!> <div class="password-strength-requirements svelte-a88ya4"><!> <!> <!> <!></div>`, 1);
var root_2 = $.from_html(`<div class="password-strength-length svelte-a88ya4"><!></div> <!>`, 1);

export default function PasswordStrengthPolicy($$anchor, $$props) {
	$.push($$props, true);

	const getInitial = () => $$props.policy;
	let passwordMinLength = $.state($.proxy(getInitial().min));
	let passwordUppercase = $.state($.proxy(getInitial().uppercase));
	let passwordLowercase = $.state($.proxy(getInitial().lowercase));
	let passwordNumber = $.state($.proxy(getInitial().number));
	let passwordSymbols = $.state($.proxy(getInitial().symbols));
	const hasChanges = $.derived(() => Number($.get(passwordMinLength)) !== $$props.policy.min || $.get(passwordUppercase) !== $$props.policy.uppercase || $.get(passwordLowercase) !== $$props.policy.lowercase || $.get(passwordNumber) !== $$props.policy.number || $.get(passwordSymbols) !== $$props.policy.symbols);

	async function updatePasswordStrengthPolicy() {
		try {
			await sdk.forProject($$props.project.region, $$props.project.$id).project.updatePasswordStrengthPolicy({
				min: $.get(passwordMinLength),
				uppercase: $.get(passwordUppercase),
				lowercase: $.get(passwordLowercase),
				number: $.get(passwordNumber),
				symbols: $.get(passwordSymbols)
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

	Form($$anchor, {
		onSubmit: updatePasswordStrengthPolicy,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				gap: 'xxl',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Set the minimum requirements users must meet when creating or changing a password.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Password strength');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'm',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var div = $.first_child(fragment_3);
									var node_1 = $.child(div);

									InputNumber(node_1, {
										required: true,
										max: 256,
										min: 8,
										label: 'Minimum length',
										id: 'password-strength-min',
										get value() {
											return $.get(passwordMinLength);
										},

										set value($$value) {
											$.set(passwordMinLength, $$value, true);
										},

										$$slots: {
											info: ($$anchor, $$slotProps) => {
												Tooltip($$anchor, {
													slot: 'info',
													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconInfo;
															},
															size: 's'
														});
													},

													$$slots: {
														default: true,
														tooltip: ($$anchor, $$slotProps) => {
															var span = root();

															$.append($$anchor, span);
														}
													}
												});
											}
										}
									});

									$.reset(div);

									var node_2 = $.sibling(div, 2);

									$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_3 = $.first_child(fragment_6);

												$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														size: 'm',
														weight: 'medium',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Character requirements');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var div_1 = $.sibling(node_3, 2);
												var node_4 = $.child(div_1);

												InputCheckbox(node_4, {
													id: 'password-strength-uppercase',
													label: 'Uppercase letter',
													get checked() {
														return $.get(passwordUppercase);
													},

													set checked($$value) {
														$.set(passwordUppercase, $$value, true);
													}
												});

												var node_5 = $.sibling(node_4, 2);

												InputCheckbox(node_5, {
													id: 'password-strength-lowercase',
													label: 'Lowercase letter',
													get checked() {
														return $.get(passwordLowercase);
													},

													set checked($$value) {
														$.set(passwordLowercase, $$value, true);
													}
												});

												var node_6 = $.sibling(node_5, 2);

												InputCheckbox(node_6, {
													id: 'password-strength-number',
													label: 'Number',
													get checked() {
														return $.get(passwordNumber);
													},

													set checked($$value) {
														$.set(passwordNumber, $$value, true);
													}
												});

												var node_7 = $.sibling(node_6, 2);

												InputCheckbox(node_7, {
													id: 'password-strength-symbols',
													label: 'Special character',
													get checked() {
														return $.get(passwordSymbols);
													},

													set checked($$value) {
														$.set(passwordSymbols, $$value, true);
													}
												});

												$.reset(div_1);
												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
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