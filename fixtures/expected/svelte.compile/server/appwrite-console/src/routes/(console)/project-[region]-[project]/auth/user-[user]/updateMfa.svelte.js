import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { Form, Button, InputChoice } from '$lib/elements/forms';
import { onMount } from 'svelte';
import DeleteMfa from './deleteMfa.svelte';
import { userFactors } from './store';
import { user } from './store';
import { sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { addNotification } from '$lib/stores/notifications';
import { Dependencies } from '$lib/constants';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Card, Empty, Table } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';

export default function UpdateMfa($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showDelete = false;
		let userMfa = null;

		onMount(async () => {
			userMfa ??= $.store_get($$store_subs ??= {}, '$user', user).mfa;
		});

		async function updateMfa() {
			try {
				await sdk.forProject(page.params.region, page.params.project).users.updateMFA({
					userId: $.store_get($$store_subs ??= {}, '$user', user).$id,
					mfa: userMfa
				});

				await invalidate(Dependencies.USER);

				addNotification({
					message: `Multi-factor authentication has been ${userMfa ? 'enabled' : 'disabled'}`,
					type: 'success'
				});

				trackEvent(Submit.UserUpdateMfa);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.UserUpdateMfa);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateMfa,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->MFA allows users to enhance the security of their accounts in your app.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Multi-factor authentication`);
								}
							},

							aside: ($$renderer) => {
								{
									InputChoice($$renderer, {
										type: 'switchbox',
										id: 'mfa',
										label: 'Multi-factor authentication',
										get value() {
											return userMfa;
										},

										set value($$value) {
											userMfa = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if ($.store_get($$store_subs ??= {}, '$userFactors', userFactors).totp) {
										$$renderer.push('<!--[0-->');

										if (Table.Root) {
											$$renderer.push('<!--[-->');

											Table.Root($$renderer, {
												columns: [{ id: 'type' }, { id: 'actions', width: 40 }],
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { root }) => {
														if (Table.Row.Base) {
															$$renderer.push('<!--[-->');

															Table.Row.Base($$renderer, {
																root,
																children: ($$renderer) => {
																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'type',
																			root,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->TOTP (One-time code)`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Table.Cell) {
																		$$renderer.push('<!--[-->');

																		Table.Cell($$renderer, {
																			column: 'actions',
																			root,
																			children: ($$renderer) => {
																				Button($$renderer, {
																					icon: true,
																					text: true,
																					ariaLabel: 'Delete authenticator',
																					children: ($$renderer) => {
																						$$renderer.push(`<span class="icon-trash" aria-hidden="true"></span>`);
																					},
																					$$slots: { default: true }
																				});
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

													header: ($$renderer, { root }) => {
														{
															if (Table.Header.Cell) {
																$$renderer.push('<!--[-->');

																Table.Header.Cell($$renderer, {
																	column: 'type',
																	root,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Authenticator`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Table.Header.Cell) {
																$$renderer.push('<!--[-->');
																Table.Header.Cell($$renderer, { column: 'actions', root });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}
													}
												}
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');

										if (Card.Base) {
											$$renderer.push('<!--[-->');

											Card.Base($$renderer, {
												variant: 'primary',
												children: ($$renderer) => {
													Empty($$renderer, {
														type: 'secondary',
														title: 'No authenticators have been enabled.',
														description: 'Once the user adds an authenticator, you\'ll see it here.'
													});
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: userMfa === $.store_get($$store_subs ??= {}, '$user', user).mfa,
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

			$$renderer.push(`<!----> `);

			DeleteMfa($$renderer, {
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
					$$settled = false;
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