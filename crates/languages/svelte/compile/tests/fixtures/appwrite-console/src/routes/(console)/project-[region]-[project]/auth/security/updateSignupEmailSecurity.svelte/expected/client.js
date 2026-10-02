import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Layout, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`Block email addresses of free email providers. For example: <!>`, 1);

var root_1 = $.from_html(
	`Block emails with aliases, tags, subaddresses, or any other
                            provider-specific email variations. For example: <!>`,
	1
);

var root_2 = $.from_html(`Block temporary and disposable email providers. For example: <!>`, 1);

var root_3 = $.from_html(
	`Only allow corporate email addresses. Blocks free providers and
                            disposable emails. For example: <!>`,
	1
);

var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function UpdateSignupEmailSecurity($$anchor, $$props) {
	$.push($$props, true);

	const getInitialAliasedEmails = () => $$props.denyAliasedEmailPolicy.enabled;
	const getInitialDisposableEmails = () => $$props.denyDisposableEmailPolicy.enabled;
	const getInitialFreeEmails = () => $$props.denyFreeEmailPolicy.enabled;
	const getInitialCorporateEmails = () => $$props.denyCorporateEmailPolicy.enabled;
	let savedAliasedEmails = $.state($.proxy(getInitialAliasedEmails()));
	let savedDisposableEmails = $.state($.proxy(getInitialDisposableEmails()));
	let savedFreeEmails = $.state($.proxy(getInitialFreeEmails()));
	let savedCorporateEmails = $.state($.proxy(getInitialCorporateEmails()));
	let authAliasedEmails = $.state($.proxy(getInitialAliasedEmails()));
	let authDisposableEmails = $.state($.proxy(getInitialDisposableEmails()));
	let authFreeEmails = $.state($.proxy(getInitialFreeEmails()));
	let authCorporateEmails = $.state($.proxy(getInitialCorporateEmails()));

	const hasChanges = $.derived(() => {
		const aliasedChanged = $.get(authAliasedEmails) !== $.get(savedAliasedEmails);
		const disposableChanged = $.get(authDisposableEmails) !== $.get(savedDisposableEmails);
		const freeChanged = $.get(authFreeEmails) !== $.get(savedFreeEmails);
		const corporateChanged = $.get(authCorporateEmails) !== $.get(savedCorporateEmails);

		return aliasedChanged || disposableChanged || freeChanged || corporateChanged;
	});

	async function updateSignupEmailSecurity() {
		let currentSubmit = Submit.AuthAliasedEmailsUpdate;
		let hasAppliedServerChange = false;

		try {
			const projectSdk = sdk.forProject($$props.project.region, $$props.project.$id).project;

			if ($.get(authAliasedEmails) !== $.get(savedAliasedEmails)) {
				currentSubmit = Submit.AuthAliasedEmailsUpdate;
				await projectSdk.updateDenyAliasedEmailPolicy({ enabled: $.get(authAliasedEmails) });
				hasAppliedServerChange = true;
				trackEvent(Submit.AuthAliasedEmailsUpdate);
			}

			if ($.get(authDisposableEmails) !== $.get(savedDisposableEmails)) {
				currentSubmit = Submit.AuthDisposableEmailsUpdate;
				await projectSdk.updateDenyDisposableEmailPolicy({ enabled: $.get(authDisposableEmails) });
				hasAppliedServerChange = true;
				trackEvent(Submit.AuthDisposableEmailsUpdate);
			}

			if ($.get(authFreeEmails) !== $.get(savedFreeEmails)) {
				currentSubmit = Submit.AuthFreeEmailsUpdate;
				await projectSdk.updateDenyFreeEmailPolicy({ enabled: $.get(authFreeEmails) });
				hasAppliedServerChange = true;
				trackEvent(Submit.AuthFreeEmailsUpdate);
			}

			if ($.get(authCorporateEmails) !== $.get(savedCorporateEmails)) {
				currentSubmit = Submit.AuthCorporateEmailsUpdate;
				await projectSdk.updateDenyCorporateEmailPolicy({ enabled: $.get(authCorporateEmails) });
				hasAppliedServerChange = true;
				trackEvent(Submit.AuthCorporateEmailsUpdate);
			}

			$.set(savedAliasedEmails, $.get(authAliasedEmails), true);
			$.set(savedDisposableEmails, $.get(authDisposableEmails), true);
			$.set(savedFreeEmails, $.get(authFreeEmails), true);
			$.set(savedCorporateEmails, $.get(authCorporateEmails), true);
			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'Updated signup email security settings.'
			});
		} catch(error) {
			if (hasAppliedServerChange) {
				await invalidate(Dependencies.PROJECT);
			}

			addNotification({ type: 'error', message: error.message });
			trackError(error, currentSubmit);
		}
	}

	Form($$anchor, {
		onSubmit: updateSignupEmailSecurity,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				gap: 'xxl',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Control which email addresses can be used for user creation and email updates. This does not affect\n        session creation (sign in)');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Email policies');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node = $.first_child(fragment_2);

						InputSwitch(node, {
							id: 'authFreeEmails',
							label: 'Deny free emails',
							get value() {
								return $.get(authFreeEmails);
							},

							set value($$value) {
								$.set(authFreeEmails, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_1 = $.first_child(fragment_3);

									$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
										Layout_Stack($$anchor, {
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_2 = $.first_child(fragment_4);

												$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_5 = root();
															var node_3 = $.sibling($.first_child(fragment_5));

															$.component(node_3, () => Typography.Code, ($$anchor, Typography_Code) => {
																Typography_Code($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('user@gmail.com');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

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
							id: 'authAliasedEmails',
							label: 'Deny aliased emails',
							get value() {
								return $.get(authAliasedEmails);
							},

							set value($$value) {
								$.set(authAliasedEmails, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_5 = $.first_child(fragment_6);

									$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_6 = $.first_child(fragment_7);

												$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
													Typography_Text_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_8 = root_1();
															var node_7 = $.sibling($.first_child(fragment_8));

															$.component(node_7, () => Typography.Code, ($$anchor, Typography_Code_1) => {
																Typography_Code_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('user+folder1@gmail.com');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
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

						var node_8 = $.sibling(node_4, 2);

						InputSwitch(node_8, {
							id: 'authDisposableEmails',
							label: 'Deny disposable emails',
							get value() {
								return $.get(authDisposableEmails);
							},

							set value($$value) {
								$.set(authDisposableEmails, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_9 = $.first_child(fragment_9);

									$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = $.comment();
												var node_10 = $.first_child(fragment_10);

												$.component(node_10, () => Typography.Text, ($$anchor, Typography_Text_2) => {
													Typography_Text_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_11 = root_2();
															var node_11 = $.sibling($.first_child(fragment_11));

															$.component(node_11, () => Typography.Code, ($$anchor, Typography_Code_2) => {
																Typography_Code_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('alex9734@mailinator.com');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								}
							}
						});

						var node_12 = $.sibling(node_8, 2);

						InputSwitch(node_12, {
							id: 'authCorporateEmails',
							label: 'Deny non-corporate emails',
							get value() {
								return $.get(authCorporateEmails);
							},

							set value($$value) {
								$.set(authCorporateEmails, $$value, true);
							},

							$$slots: {
								description: ($$anchor, $$slotProps) => {
									var fragment_12 = $.comment();
									var node_13 = $.first_child(fragment_12);

									$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
										Layout_Stack_3($$anchor, {
											gap: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = $.comment();
												var node_14 = $.first_child(fragment_13);

												$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text_3) => {
													Typography_Text_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_14 = root_3();
															var node_15 = $.sibling($.first_child(fragment_14));

															$.component(node_15, () => Typography.Code, ($$anchor, Typography_Code_3) => {
																Typography_Code_3($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text('user@gmail.com');

																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_12);
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