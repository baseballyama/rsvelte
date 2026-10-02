import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Layout, Typography } from '@appwrite.io/pink-svelte';

export default function UpdateSignupEmailSecurity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			project,
			denyAliasedEmailPolicy,
			denyDisposableEmailPolicy,
			denyFreeEmailPolicy,
			denyCorporateEmailPolicy
		} = $$props;

		const getInitialAliasedEmails = () => denyAliasedEmailPolicy.enabled;
		const getInitialDisposableEmails = () => denyDisposableEmailPolicy.enabled;
		const getInitialFreeEmails = () => denyFreeEmailPolicy.enabled;
		const getInitialCorporateEmails = () => denyCorporateEmailPolicy.enabled;
		let savedAliasedEmails = getInitialAliasedEmails();
		let savedDisposableEmails = getInitialDisposableEmails();
		let savedFreeEmails = getInitialFreeEmails();
		let savedCorporateEmails = getInitialCorporateEmails();
		let authAliasedEmails = getInitialAliasedEmails();
		let authDisposableEmails = getInitialDisposableEmails();
		let authFreeEmails = getInitialFreeEmails();
		let authCorporateEmails = getInitialCorporateEmails();

		const hasChanges = $.derived(() => {
			const aliasedChanged = authAliasedEmails !== savedAliasedEmails;
			const disposableChanged = authDisposableEmails !== savedDisposableEmails;
			const freeChanged = authFreeEmails !== savedFreeEmails;
			const corporateChanged = authCorporateEmails !== savedCorporateEmails;

			return aliasedChanged || disposableChanged || freeChanged || corporateChanged;
		});

		async function updateSignupEmailSecurity() {
			let currentSubmit = Submit.AuthAliasedEmailsUpdate;
			let hasAppliedServerChange = false;

			try {
				const projectSdk = sdk.forProject(project.region, project.$id).project;

				if (authAliasedEmails !== savedAliasedEmails) {
					currentSubmit = Submit.AuthAliasedEmailsUpdate;
					await projectSdk.updateDenyAliasedEmailPolicy({ enabled: authAliasedEmails });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthAliasedEmailsUpdate);
				}

				if (authDisposableEmails !== savedDisposableEmails) {
					currentSubmit = Submit.AuthDisposableEmailsUpdate;
					await projectSdk.updateDenyDisposableEmailPolicy({ enabled: authDisposableEmails });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthDisposableEmailsUpdate);
				}

				if (authFreeEmails !== savedFreeEmails) {
					currentSubmit = Submit.AuthFreeEmailsUpdate;
					await projectSdk.updateDenyFreeEmailPolicy({ enabled: authFreeEmails });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthFreeEmailsUpdate);
				}

				if (authCorporateEmails !== savedCorporateEmails) {
					currentSubmit = Submit.AuthCorporateEmailsUpdate;
					await projectSdk.updateDenyCorporateEmailPolicy({ enabled: authCorporateEmails });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthCorporateEmailsUpdate);
				}

				savedAliasedEmails = authAliasedEmails;
				savedDisposableEmails = authDisposableEmails;
				savedFreeEmails = authFreeEmails;
				savedCorporateEmails = authCorporateEmails;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateSignupEmailSecurity,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						gap: 'xxl',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Control which email addresses can be used for user creation and email updates. This does not affect
        session creation (sign in)`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Email policies`);
								}
							},

							aside: ($$renderer) => {
								{
									InputSwitch($$renderer, {
										id: 'authFreeEmails',
										label: 'Deny free emails',
										get value() {
											return authFreeEmails;
										},

										set value($$value) {
											authFreeEmails = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Block email addresses of free email providers. For example: `);

																			if (Typography.Code) {
																				$$renderer.push('<!--[-->');

																				Typography.Code($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->user@gmail.com`);
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
										id: 'authAliasedEmails',
										label: 'Deny aliased emails',
										get value() {
											return authAliasedEmails;
										},

										set value($$value) {
											authAliasedEmails = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Block emails with aliases, tags, subaddresses, or any other
                            provider-specific email variations. For example: `);

																			if (Typography.Code) {
																				$$renderer.push('<!--[-->');

																				Typography.Code($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->user+folder1@gmail.com`);
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
										id: 'authDisposableEmails',
										label: 'Deny disposable emails',
										get value() {
											return authDisposableEmails;
										},

										set value($$value) {
											authDisposableEmails = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Block temporary and disposable email providers. For example: `);

																			if (Typography.Code) {
																				$$renderer.push('<!--[-->');

																				Typography.Code($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->alex9734@mailinator.com`);
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
										id: 'authCorporateEmails',
										label: 'Deny non-corporate emails',
										get value() {
											return authCorporateEmails;
										},

										set value($$value) {
											authCorporateEmails = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Only allow corporate email addresses. Blocks free providers and
                            disposable emails. For example: `);

																			if (Typography.Code) {
																				$$renderer.push('<!--[-->');

																				Typography.Code($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->user@gmail.com`);
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