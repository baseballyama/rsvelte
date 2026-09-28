import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Typography, Link, Layout } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(
	`Enabling this option prevents users from setting insecure passwords by
                        comparing the user's password with the <!>`,
	1
);

var root_2 = $.from_html(
	`Do not allow passwords that contain any part of the user's personal data.
                        This includes the user's <!>, <!>, or <!>.`,
	1
);

var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function PasswordPolicies($$anchor, $$props) {
	$.push($$props, true);

	const getInitialHistoryLimit = () => $$props.historyPolicy.total > 0 ? $$props.historyPolicy.total : 5;
	const getInitialHistoryEnabled = () => $$props.historyPolicy.total > 0;
	const getInitialDictionary = () => $$props.dictionaryPolicy.enabled;
	const getInitialPersonalDataCheck = () => $$props.personalDataPolicy.enabled;
	let savedHistoryLimit = $.state($.proxy(getInitialHistoryLimit()));
	let savedHistoryEnabled = $.state($.proxy(getInitialHistoryEnabled()));
	let savedDictionary = $.state($.proxy(getInitialDictionary()));
	let savedPersonalDataCheck = $.state($.proxy(getInitialPersonalDataCheck()));
	let lastValidHistoryLimit = $.state($.proxy(getInitialHistoryLimit()));
	let passwordHistoryLimit = $.state($.proxy(getInitialHistoryLimit()));
	let passwordDictionary = $.state($.proxy(getInitialDictionary()));
	let passwordHistoryEnabled = $.state($.proxy(getInitialHistoryEnabled()));
	let authPersonalDataCheck = $.state($.proxy(getInitialPersonalDataCheck()));

	$.user_effect(() => {
		// restore last valid limit when enabling
		if ($.get(passwordHistoryEnabled) && $.get(passwordHistoryLimit) < 1) {
			$.set(passwordHistoryLimit, $.get(lastValidHistoryLimit), true);
		}

		if ($.get(passwordHistoryLimit) > 0) {
			$.set(lastValidHistoryLimit, $.get(passwordHistoryLimit), true);
		}
	});

	const hasChanges = $.derived(() => {
		const dictChanged = $.get(passwordDictionary) !== $.get(savedDictionary);
		const dataCheckChanged = $.get(authPersonalDataCheck) !== $.get(savedPersonalDataCheck);
		const historyChanged = $.get(passwordHistoryEnabled) !== $.get(savedHistoryEnabled);
		const limitChanged = $.get(passwordHistoryEnabled) && Number($.get(passwordHistoryLimit)) !== $.get(savedHistoryLimit);

		return historyChanged || dictChanged || dataCheckChanged || limitChanged;
	});

	async function updatePasswordPolicies() {
		let currentSubmit = Submit.AuthPasswordHistoryUpdate;
		let hasAppliedServerChange = false;

		try {
			const projectSdk = sdk.forProject($$props.project.region, $$props.project.$id).project;

			if ($.get(passwordHistoryEnabled) !== $.get(savedHistoryEnabled) || $.get(passwordHistoryEnabled) && Number($.get(passwordHistoryLimit)) !== $.get(savedHistoryLimit)) {
				currentSubmit = Submit.AuthPasswordHistoryUpdate;

				await projectSdk.updatePasswordHistoryPolicy({
					total: $.get(passwordHistoryEnabled) ? $.get(passwordHistoryLimit) : null
				});

				hasAppliedServerChange = true;
				trackEvent(Submit.AuthPasswordHistoryUpdate);
			}

			if ($.get(passwordDictionary) !== $.get(savedDictionary)) {
				currentSubmit = Submit.AuthPasswordDictionaryUpdate;
				await projectSdk.updatePasswordDictionaryPolicy({ enabled: $.get(passwordDictionary) });
				hasAppliedServerChange = true;
				trackEvent(Submit.AuthPasswordDictionaryUpdate);
			}

			if ($.get(authPersonalDataCheck) !== $.get(savedPersonalDataCheck)) {
				currentSubmit = Submit.AuthPersonalDataCheckUpdate;
				await projectSdk.updatePasswordPersonalDataPolicy({ enabled: $.get(authPersonalDataCheck) });
				hasAppliedServerChange = true;
				trackEvent(Submit.AuthPersonalDataCheckUpdate);
			}

			$.set(savedHistoryLimit, $.get(passwordHistoryLimit), true);
			$.set(savedHistoryEnabled, $.get(passwordHistoryEnabled), true);
			$.set(savedDictionary, $.get(passwordDictionary), true);
			$.set(savedPersonalDataCheck, $.get(authPersonalDataCheck), true);
			await invalidate(Dependencies.PROJECT);
			addNotification({ type: 'success', message: 'Updated password policies.' });
		} catch(error) {
			if (hasAppliedServerChange) {
				await invalidate(Dependencies.PROJECT);
			}

			addNotification({ type: 'error', message: error.message });
			trackError(error, currentSubmit);
		}
	}

	Form($$anchor, {
		onSubmit: updatePasswordPolicies,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				gap: 'xxl',
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Password policies');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node = $.first_child(fragment_2);

						InputSwitch(node, {
							id: 'passwordHistoryEnabled',
							label: 'Password history',
							get value() {
								return $.get(passwordHistoryEnabled);
							},

							set value($$value) {
								$.set(passwordHistoryEnabled, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_1 = $.first_child(fragment_3);

									$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
										Layout_Stack($$anchor, {
											gap: 'm',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_2 = $.first_child(fragment_4);

												$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Enabling this option prevents users from reusing recent passwords by\n                            comparing the new password with their password history.');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_3 = $.sibling(node_2, 2);

												{
													var consequent = ($$anchor) => {
														InputNumber($$anchor, {
															required: true,
															max: 20,
															min: 1,
															autofocus: true,
															label: 'Limit',
															id: 'password-history',
															helper: 'Maximum 20 passwords.',
															get value() {
																return $.get(passwordHistoryLimit);
															},

															set value($$value) {
																$.set(passwordHistoryLimit, $$value, true);
															}
														});
													};

													$.if(node_3, ($$render) => {
														if ($.get(passwordHistoryEnabled)) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								}
							}
						});

						var node_4 = $.sibling(node, 2);

						InputSwitch(node_4, {
							id: 'passwordDictionary',
							label: 'Password dictionary',
							get value() {
								return $.get(passwordDictionary);
							},

							set value($$value) {
								$.set(passwordDictionary, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_5 = $.first_child(fragment_6);

									$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_1) => {
										Typography_Text_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_7 = root_1();
												var node_6 = $.sibling($.first_child(fragment_7));

												$.component(node_6, () => Link.Anchor, ($$anchor, Link_Anchor) => {
													Link_Anchor($$anchor, {
														target: '_blank',
														rel: 'noopener noreferrer',
														class: 'link',
														href: 'https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('10k most commonly used passwords.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								}
							}
						});

						var node_7 = $.sibling(node_4, 2);

						InputSwitch(node_7, {
							id: 'personalDataCheck',
							label: 'Disallow personal data',
							get value() {
								return $.get(authPersonalDataCheck);
							},

							set value($$value) {
								$.set(authPersonalDataCheck, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_8 = $.first_child(fragment_8);

									$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_2) => {
										Typography_Text_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_9 = root_2();
												var node_9 = $.sibling($.first_child(fragment_9));

												$.component(node_9, () => Typography.Code, ($$anchor, Typography_Code) => {
													Typography_Code($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('name');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Typography.Code, ($$anchor, Typography_Code_1) => {
													Typography_Code_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('email');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => Typography.Code, ($$anchor, Typography_Code_2) => {
													Typography_Code_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('phone');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												$.next();
												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
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

									var text_6 = $.text('Update');

									$.append($$anchor, text_6);
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