import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span><!></span> <!>`, 1);
var root_1 = $.from_html(`<span><!></span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="auth-method-item svelte-1byz0st"><!></div>`);
var root_4 = $.from_html(`<!> <div class="auth-methods-grid svelte-1byz0st"></div>`, 1);
var root_5 = $.from_html(`<img height="20" width="20"/>`);
var root_6 = $.from_html(`<ul class="grid-box"></ul>`);
var root_7 = $.from_html(`<div class="oauth-providers-empty svelte-1byz0st"><!></div>`);
var root_8 = $.from_html(`<div class="oauth-providers-header svelte-1byz0st"><!> <div class="oauth-providers-search svelte-1byz0st"><!></div></div> <!>`, 1);
var root_9 = $.from_html(`<p class="text" data-private=""> </p>`);
var root_10 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $authMethods = () => $.store_get(authMethods, '$authMethods', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/** Must stay derived from `data` so OAuth/auth toggles reflect `invalidate(Dependencies.PROJECT)` without a full reload. */
	const project = $.derived(() => $$props.data.project);

	const resolvedOAuthProviders = $.derived(() => $$props.data.oauthProviders);
	const consoleParamsMap = $.derived(() => $$props.data.consoleParamsMap);
	let showProvider = $.state(false);
	let selectedProvider = $.state(null);
	let oauthProviderSearch = $.state('');
	let isUpdatingAllAuthMethods = $.state(false);
	let showUpdateAuthMethodsDialog = $.state(false);
	let updateAuthMethodsEnabledMode = $.state(null);
	let apiAuthMethodUpdates = new SvelteSet();
	const isAnyAuthMethodUpdating = $.derived(() => apiAuthMethodUpdates.size > 0);
	const isAnyUpdateInProgress = $.derived(() => $.get(isUpdatingAllAuthMethods) || $.get(isAnyAuthMethodUpdating));

	const allAuthMethodsEnabled = $.derived(() => {
		if ($.get(isAnyUpdateInProgress)) return false;

		return $authMethods().list.every((method) => method.value);
	});

	const allAuthMethodsDisabled = $.derived(() => {
		if ($.get(isAnyUpdateInProgress)) return false;

		return $authMethods().list.every((method) => !method.value);
	});

	const shouldDisableEnableAllButton = $.derived(() => $.get(isAnyUpdateInProgress) || $.get(allAuthMethodsEnabled));
	const shouldDisableDisableAllButton = $.derived(() => $.get(isAnyUpdateInProgress) || $.get(allAuthMethodsDisabled));

	const filteredOAuthProviders = $.derived(() => {
		const search = $.get(oauthProviderSearch).trim().toLowerCase();

		return $.get(resolvedOAuthProviders).filter((provider) => {
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
			await sdk.forProject($.get(project).region, $.get(project).$id).project.updateAuthMethod({ methodId: box.method, enabled: box.value });

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

		$.set(isUpdatingAllAuthMethods, true);

		try {
			const projectSdk = sdk.forProject($.get(project).region, $.get(project).$id).project;

			for (const method of get(authMethods).list) {
				if (method.value === status) continue;

				await projectSdk.updateAuthMethod({ methodId: method.method, enabled: status });
			}

			await invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: 'All authentication methods for ' + $.get(project).name + ' have been ' + (status ? 'enabled.' : 'disabled.')
			});

			trackEvent(Submit.AuthStatusUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.AuthStatusUpdate);
		} finally {
			await invalidate(Dependencies.PROJECT);
			$.set(isUpdatingAllAuthMethods, false);
			$.set(showUpdateAuthMethodsDialog, false);
			$.set(updateAuthMethodsEnabledMode, null);
		}
	}

	const dialogDetails = $.derived(() => {
		if ($.get(updateAuthMethodsEnabledMode)) {
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

	$.user_effect(() => {
		authMethods.load($.get(project));
	});

	var fragment = root_10();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			Container($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							gap: 'xxl',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_2();
								var node_2 = $.first_child(fragment_3);

								CardGrid(node_2, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Enable the authentication methods you wish to use.');

										$.append($$anchor, text);
									},

									$$slots: {
										default: true,
										title: ($$anchor, $$slotProps) => {
											var text_1 = $.text('Auth methods');

											$.append($$anchor, text_1);
										},

										aside: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													gap: 'm',
													class: 'auth-methods-list',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_2();
														var node_4 = $.first_child(fragment_5);

														$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																direction: 'row',
																alignItems: 'center',
																gap: 's',
																class: 'auth-methods-actions',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root();
																	var node_5 = $.first_child(fragment_6);

																	Button(node_5, {
																		extraCompact: true,
																		get disabled() {
																			return $.get(shouldDisableEnableAllButton);
																		},

																		$$events: {
																			click: () => {
																				$.set(showUpdateAuthMethodsDialog, true);
																				$.set(updateAuthMethodsEnabledMode, true);
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('Enable all');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});

																	var span = $.sibling(node_5, 2);

																	$.set_style(span, '', {}, { height: '20px' });

																	var node_6 = $.child(span);

																	Divider(node_6, { vertical: true });
																	$.reset(span);

																	var node_7 = $.sibling(span, 2);

																	Button(node_7, {
																		extraCompact: true,
																		get disabled() {
																			return $.get(shouldDisableDisableAllButton);
																		},

																		$$events: {
																			click: () => {
																				$.set(showUpdateAuthMethodsDialog, true);
																				$.set(updateAuthMethodsEnabledMode, false);
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text('Disable all');

																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														var node_8 = $.sibling(node_4, 2);

														$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
															Layout_Stack_3($$anchor, {
																gap: 'l',
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = root_4();
																	var node_9 = $.first_child(fragment_7);

																	Divider(node_9, { class: 'auth-methods-divider' });

																	var div = $.sibling(node_9, 2);

																	$.each(div, 5, () => $authMethods().list, $.index, ($$anchor, box, $$index) => {
																		var div_1 = root_3();
																		var node_10 = $.child(div_1);

																		$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																			Layout_Stack_4($$anchor, {
																				direction: 'row',
																				alignItems: 'center',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root_2();
																					var node_11 = $.first_child(fragment_8);

																					{
																						let $0 = $.derived(() => apiAuthMethodUpdates.has($.get(box).method));

																						InputSwitch(node_11, {
																							get label() {
																								return $.get(box).label;
																							},

																							get id() {
																								return $.get(box).method;
																							},

																							get disabled() {
																								return $.get($0);
																							},

																							get value() {
																								return $.get(box).value;
																							},

																							set value($$value) {
																								(
																									$.get(box).value = $$value,
																									$.invalidate_store($$stores, '$authMethods')
																								);
																							},
																							$$events: { change: () => authUpdate($.get(box)) }
																						});
																					}

																					var node_12 = $.sibling(node_11, 2);

																					{
																						var consequent = ($$anchor) => {
																							var span_1 = root_1();

																							$.set_style(span_1, '', {}, { opacity: '0.75' });

																							var node_13 = $.child(span_1);

																							Spinner(node_13, { size: 's' });
																							$.reset(span_1);
																							$.append($$anchor, span_1);
																						};

																						var d = $.derived(() => apiAuthMethodUpdates.has($.get(box).method));

																						$.if(node_12, ($$render) => {
																							if ($.get(d)) $$render(consequent);
																						});
																					}

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.reset(div_1);
																		$.append($$anchor, div_1);
																	});

																	$.reset(div);
																	$.append($$anchor, fragment_7);
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
										}
									}
								});

								var node_14 = $.sibling(node_2, 2);

								$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
									Layout_Stack_5($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_8();
											var div_2 = $.first_child(fragment_9);
											var node_15 = $.child(div_2);

											$.component(node_15, () => Typography.Title, ($$anchor, Typography_Title) => {
												Typography_Title($$anchor, {
													size: 's',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('OAuth2 Providers');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var div_3 = $.sibling(node_15, 2);
											var node_16 = $.child(div_3);

											InputSearch(node_16, {
												placeholder: 'Search OAuth2 providers',
												get value() {
													return $.get(oauthProviderSearch);
												},

												set value($$value) {
													$.set(oauthProviderSearch, $$value, true);
												}
											});

											$.reset(div_3);
											$.reset(div_2);

											var node_17 = $.sibling(div_2, 2);

											{
												var consequent_1 = ($$anchor) => {
													var ul = root_6();

													$.set_style(ul, '', {}, { '--grid-gap': '1rem', '--grid-item-size': '15rem' });

													$.each(ul, 21, () => $.get(filteredOAuthProviders), (provider) => provider.key, ($$anchor, provider) => {
														const oAuthProvider = $.derived(() => oAuthProviders[$.get(provider).key]);
														var fragment_10 = $.comment();
														var node_18 = $.first_child(fragment_10);

														$.component(node_18, () => Card.Button, ($$anchor, Card_Button) => {
															Card_Button($$anchor, {
																padding: 's',
																$$events: {
																	click: () => {
																		$.set(selectedProvider, $.get(provider), true);
																		$.set(showProvider, true);
																		trackEvent(`click_select_provider`, { provider: $.get(provider).key.toLowerCase() });
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_11 = $.comment();
																	var node_19 = $.first_child(fragment_11);

																	$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																		Layout_Stack_6($$anchor, {
																			alignItems: 'flex-start',
																			gap: 'xxl',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_12 = root_2();
																				var node_20 = $.first_child(fragment_12);

																				$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																					Layout_Stack_7($$anchor, {
																						direction: 'row',
																						justifyContent: 'flex-start',
																						alignItems: 'center',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_13 = root_2();
																							var node_21 = $.first_child(fragment_13);

																							Avatar(node_21, {
																								size: 's',
																								children: ($$anchor, $$slotProps) => {
																									var img = root_5();

																									$.template_effect(() => {
																										$.set_attribute(img, 'src', `${base}/icons/${$app().themeInUse}/color/${$.get(oAuthProvider).icon}.svg`);
																										$.set_attribute(img, 'alt', $.get(provider).name);
																									});

																									$.append($$anchor, img);
																								},
																								$$slots: { default: true }
																							});

																							var node_22 = $.sibling(node_21, 2);

																							$.component(node_22, () => Typography.Text, ($$anchor, Typography_Text) => {
																								Typography_Text($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_5 = $.text();

																										$.template_effect(() => $.set_text(text_5, $.get(provider).name));
																										$.append($$anchor, text_5);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_13);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_23 = $.sibling(node_20, 2);

																				{
																					let $0 = $.derived(() => $.get(provider).enabled ? 'success' : undefined);
																					let $1 = $.derived(() => $.get(provider).enabled ? 'enabled' : 'disabled');

																					Badge(node_23, {
																						get type() {
																							return $.get($0);
																						},
																						variant: 'secondary',
																						get content() {
																							return $.get($1);
																						}
																					});
																				}

																				$.append($$anchor, fragment_12);
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
													});

													$.reset(ul);
													$.append($$anchor, ul);
												};

												var alternate = ($$anchor) => {
													var div_4 = root_7();
													var node_24 = $.child(div_4);

													$.component(node_24, () => Typography.Text, ($$anchor, Typography_Text_1) => {
														Typography_Text_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('No OAuth2 providers match your search.');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													$.reset(div_4);
													$.append($$anchor, div_4);
												};

												$.if(node_17, ($$render) => {
													if ($.get(filteredOAuthProviders).length) $$render(consequent_1); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_9);
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
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($authMethods() && $.get(project)) $$render(consequent_2);
		});
	}

	var node_25 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			const OAuthProvider = $.derived(() => oAuthProviders[$.get(selectedProvider).key].component);
			var fragment_15 = $.comment();
			var node_26 = $.first_child(fragment_15);

			{
				let $0 = $.derived(() => $.get(consoleParamsMap).get($.get(selectedProvider).key) ?? []);

				$.component(node_26, () => $.get(OAuthProvider), ($$anchor, OAuthProvider_1) => {
					OAuthProvider_1($$anchor, {
						get parameters() {
							return $.get($0);
						},

						onclose: () => {
							$.set(selectedProvider, null);
							$.set(showProvider, false);
						},

						get provider() {
							return $.get(selectedProvider);
						},

						set provider($$value) {
							$.set(selectedProvider, $$value, true);
						},

						get show() {
							return $.get(showProvider);
						},

						set show($$value) {
							$.set(showProvider, $$value, true);
						}
					});
				});
			}

			$.append($$anchor, fragment_15);
		};

		$.if(node_25, ($$render) => {
			if ($.get(selectedProvider) && $.get(showProvider)) $$render(consequent_3);
		});
	}

	var node_27 = $.sibling(node_25, 2);

	Dialog(node_27, {
		get title() {
			return $.get(dialogDetails).title;
		},

		get open() {
			return $.get(showUpdateAuthMethodsDialog);
		},

		set open($$value) {
			$.set(showUpdateAuthMethodsDialog, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var p = root_9();
			var text_7 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_7, $.get(dialogDetails).message));
			$.append($$anchor, p);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_16 = $.comment();
				var node_28 = $.first_child(fragment_16);

				$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
					Layout_Stack_8($$anchor, {
						direction: 'row',
						gap: 's',
						justifyContent: 'flex-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root_2();
							var node_29 = $.first_child(fragment_17);

							Button(node_29, {
								text: true,
								$$events: { click: () => $.set(showUpdateAuthMethodsDialog, false) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Cancel');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_30 = $.sibling(node_29, 2);

							Button(node_30, {
								secondary: true,
								submissionLoader: true,
								get disabled() {
									return $.get(isUpdatingAllAuthMethods);
								},

								get forceShowLoader() {
									return $.get(isUpdatingAllAuthMethods);
								},

								$$events: {
									click: () => toggleAllAuthMethods($.get(updateAuthMethodsEnabledMode))
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text();

									$.template_effect(() => $.set_text(text_9, $.get(dialogDetails).actionButton));
									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_16);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}