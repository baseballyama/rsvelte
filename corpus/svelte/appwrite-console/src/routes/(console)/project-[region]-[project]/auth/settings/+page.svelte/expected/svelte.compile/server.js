import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { InputSearch, InputSwitch } from '$lib/elements/forms';
import Button from '$lib/elements/forms/button.svelte';
import { Container } from '$lib/layout';
import { app } from '$lib/stores/app';
import { authMethods } from '$lib/stores/auth-methods';
import { addNotification } from '$lib/stores/notifications';
import { oAuthProviders } from '$lib/stores/oauth-providers';
import { sdk } from '$lib/stores/sdk';
import { ProjectAuthMethodId } from '@appwrite.io/console';
import { base } from '$app/paths';

import {
	Avatar,
	Badge,
	Card,
	Dialog,
	Divider,
	Layout,
	Spinner,
	Typography
} from '@appwrite.io/pink-svelte';

import { Dependencies } from '$lib/constants';
import { SvelteSet } from 'svelte/reactivity';
import { get } from 'svelte/store';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		/** Must stay derived from `data` so OAuth/auth toggles reflect `invalidate(Dependencies.PROJECT)` without a full reload. */
		const project = $.derived(() => data.project);

		const resolvedOAuthProviders = $.derived(() => data.oauthProviders);
		const consoleParamsMap = $.derived(() => data.consoleParamsMap);
		let showProvider = false;
		let selectedProvider = null;
		let oauthProviderSearch = '';
		let isUpdatingAllAuthMethods = false;
		let showUpdateAuthMethodsDialog = false;
		let updateAuthMethodsEnabledMode = null;
		let apiAuthMethodUpdates = new SvelteSet();
		const isAnyAuthMethodUpdating = $.derived(() => apiAuthMethodUpdates.size > 0);
		const isAnyUpdateInProgress = $.derived(() => isUpdatingAllAuthMethods || isAnyAuthMethodUpdating());

		const allAuthMethodsEnabled = $.derived(() => {
			if (isAnyUpdateInProgress()) return false;

			return $.store_get($$store_subs ??= {}, '$authMethods', authMethods).list.every((method) => method.value);
		});

		const allAuthMethodsDisabled = $.derived(() => {
			if (isAnyUpdateInProgress()) return false;

			return $.store_get($$store_subs ??= {}, '$authMethods', authMethods).list.every((method) => !method.value);
		});

		const shouldDisableEnableAllButton = $.derived(() => isAnyUpdateInProgress() || allAuthMethodsEnabled());
		const shouldDisableDisableAllButton = $.derived(() => isAnyUpdateInProgress() || allAuthMethodsDisabled());

		const filteredOAuthProviders = $.derived(() => {
			const search = oauthProviderSearch.trim().toLowerCase();

			return resolvedOAuthProviders().filter((provider) => {
				const oAuthProvider = oAuthProviders[provider.key];

				if (!oAuthProvider || oAuthProvider.internal) return false;
				if (provider.key === 'mock' || provider.name === 'Mock') return false;
				if (!search) return true;

				return provider.name.toLowerCase().includes(search) || provider.key.toLowerCase().includes(search);
			}).sort((a, b) => {
				if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;

				return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
			});
		});

		async function authUpdate(box) {
			apiAuthMethodUpdates.add(box.method);

			try {
				await sdk.forProject(project().region, project().$id).project.updateAuthMethod({ methodId: box.method, enabled: box.value });

				addNotification({
					type: 'success',
					message: `${box.label} authentication has been updated`
				});

				trackEvent(Submit.AuthStatusUpdate, { method: box.method, value: box.value });
				await invalidate(Dependencies.PROJECT);
			} catch(error) {
				box.value = !box.value;
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthStatusUpdate);
			} finally {
				apiAuthMethodUpdates.delete(box.method);
			}
		}

		async function toggleAllAuthMethods(status) {
			if (status === null) return;

			isUpdatingAllAuthMethods = true;

			try {
				const projectSdk = sdk.forProject(project().region, project().$id).project;

				for (const method of get(authMethods).list) {
					if (method.value === status) continue;

					await projectSdk.updateAuthMethod({ methodId: method.method, enabled: status });
				}

				await invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: 'All authentication methods for ' + project().name + ' have been ' + (status ? 'enabled.' : 'disabled.')
				});

				trackEvent(Submit.AuthStatusUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthStatusUpdate);
			} finally {
				await invalidate(Dependencies.PROJECT);
				isUpdatingAllAuthMethods = false;
				showUpdateAuthMethodsDialog = false;
				updateAuthMethodsEnabledMode = null;
			}
		}

		const dialogDetails = $.derived(() => {
			if (updateAuthMethodsEnabledMode) {
				return {
					title: 'Enable all auth methods',
					message: 'All authentication methods will be enabled.',
					actionButton: 'Enable all'
				};
			}

			return {
				title: 'Disable all auth methods',
				message: 'Are you sure you want to disable all authentication methods? This will prevent users from signing in until at least one method is re-enabled.',
				actionButton: 'Disable all'
			};
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$authMethods', authMethods) && project()) {
				$$renderer.push('<!--[0-->');

				Container($$renderer, {
					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xxl',
								children: ($$renderer) => {
									CardGrid($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Enable the authentication methods you wish to use.`);
										},

										$$slots: {
											default: true,
											title: ($$renderer) => {
												{
													$$renderer.push(`Auth methods`);
												}
											},

											aside: ($$renderer) => {
												{
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'm',
															class: 'auth-methods-list',
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		alignItems: 'center',
																		gap: 's',
																		class: 'auth-methods-actions',
																		children: ($$renderer) => {
																			Button($$renderer, {
																				extraCompact: true,
																				disabled: shouldDisableEnableAllButton(),
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Enable all`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> <span${$.attr_style('', { height: '20px' })}>`);
																			Divider($$renderer, { vertical: true });
																			$$renderer.push(`<!----></span> `);

																			Button($$renderer, {
																				extraCompact: true,
																				disabled: shouldDisableDisableAllButton(),
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Disable all`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!---->`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		gap: 'l',
																		children: ($$renderer) => {
																			Divider($$renderer, { class: 'auth-methods-divider' });
																			$$renderer.push(`<!----> <div class="auth-methods-grid svelte-1byz0st"><!--[-->`);

																			const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$authMethods', authMethods).list);

																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																				let box = each_array[$$index];

																				$$renderer.push(`<div class="auth-method-item svelte-1byz0st">`);

																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						direction: 'row',
																						alignItems: 'center',
																						children: ($$renderer) => {
																							InputSwitch($$renderer, {
																								label: box.label,
																								id: box.method,
																								disabled: apiAuthMethodUpdates.has(box.method),
																								get value() {
																									return box.value;
																								},

																								set value($$value) {
																									box.value = $$value;
																									$$settled = false;
																								}
																							});

																							$$renderer.push(`<!----> `);

																							if (apiAuthMethodUpdates.has(box.method)) {
																								$$renderer.push(`<!--[0--><span${$.attr_style('', { opacity: '0.75' })}>`);
																								Spinner($$renderer, { size: 's' });
																								$$renderer.push(`<!----></span>`);
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

																				$$renderer.push(`</div>`);
																			}

																			$$renderer.push(`<!--]--></div>`);
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

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<div class="oauth-providers-header svelte-1byz0st">`);

												if (Typography.Title) {
													$$renderer.push('<!--[-->');

													Typography.Title($$renderer, {
														size: 's',
														children: ($$renderer) => {
															$$renderer.push(`<!---->OAuth2 Providers`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` <div class="oauth-providers-search svelte-1byz0st">`);

												InputSearch($$renderer, {
													placeholder: 'Search OAuth2 providers',
													get value() {
														return oauthProviderSearch;
													},

													set value($$value) {
														oauthProviderSearch = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div></div> `);

												if (filteredOAuthProviders().length) {
													$$renderer.push(`<!--[0--><ul class="grid-box"${$.attr_style('', { '--grid-gap': '1rem', '--grid-item-size': '15rem' })}><!--[-->`);

													const each_array_1 = $.ensure_array_like(filteredOAuthProviders());

													for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
														let provider = each_array_1[$$index_1];
														const oAuthProvider = oAuthProviders[provider.key];

														if (Card.Button) {
															$$renderer.push('<!--[-->');

															Card.Button($$renderer, {
																padding: 's',
																children: ($$renderer) => {
																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			alignItems: 'flex-start',
																			gap: 'xxl',
																			children: ($$renderer) => {
																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						direction: 'row',
																						justifyContent: 'flex-start',
																						alignItems: 'center',
																						children: ($$renderer) => {
																							Avatar($$renderer, {
																								size: 's',
																								children: ($$renderer) => {
																									$$renderer.push(`<img height="20" width="20"${$.attr('src', `${base}/icons/${$.store_get($$store_subs ??= {}, '$app', app).themeInUse}/color/${oAuthProvider.icon}.svg`)}${$.attr('alt', provider.name)}/>`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push(`<!----> `);

																							if (Typography.Text) {
																								$$renderer.push('<!--[-->');

																								Typography.Text($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->${$.escape(provider.name)}`);
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

																				$$renderer.push(` `);

																				Badge($$renderer, {
																					type: provider.enabled ? 'success' : undefined,
																					variant: 'secondary',
																					content: provider.enabled ? 'enabled' : 'disabled'
																				});

																				$$renderer.push(`<!---->`);
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

													$$renderer.push(`<!--]--></ul>`);
												} else {
													$$renderer.push(`<!--[-1--><div class="oauth-providers-empty svelte-1byz0st">`);

													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->No OAuth2 providers match your search.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(`</div>`);
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (selectedProvider && showProvider) {
				$$renderer.push('<!--[0-->');

				const OAuthProvider = oAuthProviders[selectedProvider.key].component;

				if (OAuthProvider) {
					$$renderer.push('<!--[-->');

					OAuthProvider($$renderer, {
						parameters: consoleParamsMap().get(selectedProvider.key) ?? [],
						onclose: () => {
							selectedProvider = null;
							showProvider = false;
						},

						get provider() {
							return selectedProvider;
						},

						set provider($$value) {
							selectedProvider = $$value;
							$$settled = false;
						},

						get show() {
							return showProvider;
						},

						set show($$value) {
							showProvider = $$value;
							$$settled = false;
						}
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Dialog($$renderer, {
				title: dialogDetails().title,
				get open() {
					return showUpdateAuthMethodsDialog;
				},

				set open($$value) {
					showUpdateAuthMethodsDialog = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<p class="text" data-private="">${$.escape(dialogDetails().message)}</p>`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 's',
									justifyContent: 'flex-end',
									children: ($$renderer) => {
										Button($$renderer, {
											text: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											secondary: true,
											submissionLoader: true,
											disabled: isUpdatingAllAuthMethods,
											forceShowLoader: isUpdatingAllAuthMethods,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(dialogDetails().actionButton)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}