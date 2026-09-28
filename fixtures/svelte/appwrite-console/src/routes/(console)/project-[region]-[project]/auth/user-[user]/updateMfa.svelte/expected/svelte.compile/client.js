import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<span class="icon-trash" aria-hidden="true"></span>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function UpdateMfa($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const $userFactors = () => $.store_get(userFactors, '$userFactors', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = false;
	let userMfa = null;

	onMount(async () => {
		userMfa ??= $user().mfa;
	});

	async function updateMfa() {
		try {
			await sdk.forProject(page.params.region, page.params.project).users.updateMFA({ userId: $user().$id, mfa: userMfa });
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

	var fragment = root_2();
	var node = $.first_child(fragment);

	Form(node, {
		onSubmit: updateMfa,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('MFA allows users to enhance the security of their accounts in your app.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Multi-factor authentication');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						InputChoice(node_1, {
							type: 'switchbox',
							id: 'mfa',
							label: 'Multi-factor authentication',
							get value() {
								return userMfa;
							},

							set value($$value) {
								userMfa = $$value;
							}
						});

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Table.Root, ($$anchor, Table_Root) => {
									Table_Root($$anchor, {
										columns: [{ id: 'type' }, { id: 'actions', width: 40 }],
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
													Table_Row_Base($$anchor, {
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_2();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
																Table_Cell($$anchor, {
																	column: 'type',
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('TOTP (One-time code)');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																Table_Cell_1($$anchor, {
																	column: 'actions',
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
																		Button($$anchor, {
																			icon: true,
																			text: true,
																			ariaLabel: 'Delete authenticator',
																			$$events: { click: () => showDelete = true },
																			children: ($$anchor, $$slotProps) => {
																				var span = root_1();

																				$.append($$anchor, span);
																			},
																			$$slots: { default: true }
																		});
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

											header: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_7 = root_2();
												var node_7 = $.first_child(fragment_7);

												$.component(node_7, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
													Table_Header_Cell($$anchor, {
														column: 'type',
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Authenticator');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
													Table_Header_Cell_1($$anchor, {
														column: 'actions',
														get root() {
															return $.get(root);
														}
													});
												});

												$.append($$anchor, fragment_7);
											}
										}
									});
								});

								$.append($$anchor, fragment_3);
							};

							var alternate = ($$anchor) => {
								var fragment_8 = $.comment();
								var node_9 = $.first_child(fragment_8);

								$.component(node_9, () => Card.Base, ($$anchor, Card_Base) => {
									Card_Base($$anchor, {
										variant: 'primary',
										children: ($$anchor, $$slotProps) => {
											Empty($$anchor, {
												type: 'secondary',
												title: 'No authenticators have been enabled.',
												description: 'Once the user adds an authenticator, you\'ll see it here.'
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							};

							$.if(node_2, ($$render) => {
								if ($userFactors().totp) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => userMfa === $user().mfa);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Update');

									$.append($$anchor, text_4);
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

	var node_10 = $.sibling(node, 2);

	DeleteMfa(node_10, {
		get showDelete() {
			return showDelete;
		},

		set showDelete($$value) {
			showDelete = $$value;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}