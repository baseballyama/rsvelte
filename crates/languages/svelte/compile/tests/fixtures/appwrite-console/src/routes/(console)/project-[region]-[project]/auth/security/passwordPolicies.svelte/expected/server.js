import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Typography, Link, Layout } from '@appwrite.io/pink-svelte';

export default function PasswordPolicies($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { project, dictionaryPolicy, historyPolicy, personalDataPolicy } = $$props;
		const getInitialHistoryLimit = () => historyPolicy.total > 0 ? historyPolicy.total : 5;
		const getInitialHistoryEnabled = () => historyPolicy.total > 0;
		const getInitialDictionary = () => dictionaryPolicy.enabled;
		const getInitialPersonalDataCheck = () => personalDataPolicy.enabled;
		let savedHistoryLimit = getInitialHistoryLimit();
		let savedHistoryEnabled = getInitialHistoryEnabled();
		let savedDictionary = getInitialDictionary();
		let savedPersonalDataCheck = getInitialPersonalDataCheck();
		let lastValidHistoryLimit = getInitialHistoryLimit();
		let passwordHistoryLimit = getInitialHistoryLimit();
		let passwordDictionary = getInitialDictionary();
		let passwordHistoryEnabled = getInitialHistoryEnabled();
		let authPersonalDataCheck = getInitialPersonalDataCheck();

		// restore last valid limit when enabling
		const hasChanges = $.derived(() => {
			const dictChanged = passwordDictionary !== savedDictionary;
			const dataCheckChanged = authPersonalDataCheck !== savedPersonalDataCheck;
			const historyChanged = passwordHistoryEnabled !== savedHistoryEnabled;
			const limitChanged = passwordHistoryEnabled && Number(passwordHistoryLimit) !== savedHistoryLimit;

			return historyChanged || dictChanged || dataCheckChanged || limitChanged;
		});

		async function updatePasswordPolicies() {
			let currentSubmit = Submit.AuthPasswordHistoryUpdate;
			let hasAppliedServerChange = false;

			try {
				const projectSdk = sdk.forProject(project.region, project.$id).project;

				if (passwordHistoryEnabled !== savedHistoryEnabled || passwordHistoryEnabled && Number(passwordHistoryLimit) !== savedHistoryLimit) {
					currentSubmit = Submit.AuthPasswordHistoryUpdate;
					await projectSdk.updatePasswordHistoryPolicy({ total: passwordHistoryEnabled ? passwordHistoryLimit : null });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthPasswordHistoryUpdate);
				}

				if (passwordDictionary !== savedDictionary) {
					currentSubmit = Submit.AuthPasswordDictionaryUpdate;
					await projectSdk.updatePasswordDictionaryPolicy({ enabled: passwordDictionary });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthPasswordDictionaryUpdate);
				}

				if (authPersonalDataCheck !== savedPersonalDataCheck) {
					currentSubmit = Submit.AuthPersonalDataCheckUpdate;
					await projectSdk.updatePasswordPersonalDataPolicy({ enabled: authPersonalDataCheck });
					hasAppliedServerChange = true;
					trackEvent(Submit.AuthPersonalDataCheckUpdate);
				}

				savedHistoryLimit = passwordHistoryLimit;
				savedHistoryEnabled = passwordHistoryEnabled;
				savedDictionary = passwordDictionary;
				savedPersonalDataCheck = authPersonalDataCheck;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updatePasswordPolicies,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						gap: 'xxl',
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Password policies`);
								}
							},

							aside: ($$renderer) => {
								{
									InputSwitch($$renderer, {
										id: 'passwordHistoryEnabled',
										label: 'Password history',
										get value() {
											return passwordHistoryEnabled;
										},

										set value($$value) {
											passwordHistoryEnabled = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'm',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Enabling this option prevents users from reusing recent passwords by
                            comparing the new password with their password history.`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (passwordHistoryEnabled) {
																	$$renderer.push('<!--[0-->');

																	InputNumber($$renderer, {
																		required: true,
																		max: 20,
																		min: 1,
																		autofocus: true,
																		label: 'Limit',
																		id: 'password-history',
																		helper: 'Maximum 20 passwords.',
																		get value() {
																			return passwordHistoryLimit;
																		},

																		set value($$value) {
																			passwordHistoryLimit = $$value;
																			$$settled = false;
																		}
																	});
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
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
										id: 'passwordDictionary',
										label: 'Password dictionary',
										get value() {
											return passwordDictionary;
										},

										set value($$value) {
											passwordDictionary = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Enabling this option prevents users from setting insecure passwords by
                        comparing the user's password with the `);

																if (Link.Anchor) {
																	$$renderer.push('<!--[-->');

																	Link.Anchor($$renderer, {
																		target: '_blank',
																		rel: 'noopener noreferrer',
																		class: 'link',
																		href: 'https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10k-most-common.txt',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->10k most commonly used passwords.`);
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
										id: 'personalDataCheck',
										label: 'Disallow personal data',
										get value() {
											return authPersonalDataCheck;
										},

										set value($$value) {
											authPersonalDataCheck = $$value;
											$$settled = false;
										},

										$$slots: {
											description: ($$renderer) => {
												{
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Do not allow passwords that contain any part of the user's personal data.
                        This includes the user's `);

																if (Typography.Code) {
																	$$renderer.push('<!--[-->');

																	Typography.Code($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->name`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`, `);

																if (Typography.Code) {
																	$$renderer.push('<!--[-->');

																	Typography.Code($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->email`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`, or `);

																if (Typography.Code) {
																	$$renderer.push('<!--[-->');

																	Typography.Code($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->phone`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`.`);
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