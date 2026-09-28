import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { Label } from '$lib/components/ui/label';
import * as Card from '$lib/components/ui/card';
import * as Password from '$lib/components/ui/password';
import { Input } from '$lib/components/ui/input';
import { sleep } from '$lib/utils/sleep';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form method="POST" class="flex flex-col gap-4"><!> <!></form>`);

export default function Signup_form($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(false);

	async function submit() {
		$.set(loading, true);
		await sleep(500);
		$.set(loading, false);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Create an account');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Enter your email below to create your account');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var node_5 = $.child(form);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

													Label(node_7, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Email');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, {
														name: 'email',
														type: 'email',
														placeholder: 'm@example.com',
														required: true
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_10 = $.first_child(fragment_5);

													Label(node_10, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Password');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Password.Root, ($$anchor, Password_Root) => {
														Password_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_12 = $.first_child(fragment_6);

																$.component(node_12, () => Password.Input, ($$anchor, Password_Input) => {
																	Password_Input($$anchor, {
																		name: 'password',
																		required: true,
																		placeholder: 'Password',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = $.comment();
																			var node_13 = $.first_child(fragment_7);

																			$.component(node_13, () => Password.ToggleVisibility, ($$anchor, Password_ToggleVisibility) => {
																				Password_ToggleVisibility($$anchor, {});
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_12, 2);

																$.component(node_14, () => Password.Strength, ($$anchor, Password_Strength) => {
																	Password_Strength($$anchor, {});
																});

																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_15 = $.sibling(node_5, 2);

							Button(node_15, {
								type: 'submit',
								class: 'w-full',
								get loading() {
									return $.get(loading);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Create account');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.reset(form);
							$.action(form, ($$node) => enhance?.($$node));

							$.event('submit', form, (e) => {
								e.preventDefault();
								submit();
							});

							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}