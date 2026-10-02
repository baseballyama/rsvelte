import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center"><!> <a href="#/" class="ml-auto inline-block underline-offset-4 hover:underline">Forgot your password?</a></div> <!>`, 1);
var root_2 = $.from_html(`<form><!></form>`);
var root_3 = $.from_html(`<!> <!> <div class="mt-4 text-center style-nova:mt-2">Don't have an account? <a href="#/" class="underline underline-offset-4">Sign up</a></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Card_login($$anchor) {
	Example($$anchor, {
		title: 'Login',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Login to your account');

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

												var text_1 = $.text('Enter your email below to login to your account');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_2();
									var node_5 = $.child(form);

									$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_6 = $.first_child(fragment_4);

												$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'email',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('Email');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Input.Root, ($$anchor, Input_Root) => {
																Input_Root($$anchor, {
																	id: 'email',
																	type: 'email',
																	placeholder: 'm@example.com',
																	required: true
																});
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_6, 2);

												$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var div = $.first_child(fragment_6);
															var node_10 = $.child(div);

															$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'password',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Password');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.next(2);
															$.reset(div);

															var node_11 = $.sibling(div, 2);

															$.component(node_11, () => Input.Root, ($$anchor, Input_Root_1) => {
																Input_Root_1($$anchor, { id: 'password', type: 'password', required: true });
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									$.reset(form);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_4, 2);

						$.component(node_12, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex-col gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();
									var node_13 = $.first_child(fragment_7);

									$.component(node_13, () => Button.Root, ($$anchor, Button_Root) => {
										Button_Root($$anchor, {
											type: 'submit',
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Login');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Button.Root, ($$anchor, Button_Root_1) => {
										Button_Root_1($$anchor, {
											variant: 'outline',
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Login with Google');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}