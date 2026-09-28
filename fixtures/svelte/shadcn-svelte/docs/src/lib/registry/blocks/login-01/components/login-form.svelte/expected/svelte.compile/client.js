import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center"><!> <a href="##" class="ms-auto inline-block text-sm underline">Forgot your password?</a></div> <!>`, 1);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg> Login with Google`, 1);
var root_3 = $.from_html(`Don't have an account? <a href="##">Sign up</a>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<form><!></form>`);

export default function Login_form($$anchor) {
	const id = $.props_id();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'mx-auto w-full max-w-sm',
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
									class: 'text-2xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Login');

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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_5();
							var node_5 = $.child(form);

							FieldGroup(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_4();
									var node_6 = $.first_child(fragment_3);

									Field(node_6, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_7 = $.first_child(fragment_4);

											FieldLabel(node_7, {
												get for() {
													return `email-${id}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Email');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											var node_8 = $.sibling(node_7, 2);

											Input(node_8, {
												get id() {
													return `email-${id}`;
												},
												type: 'email',
												placeholder: 'm@example.com',
												required: true
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_6, 2);

									Field(node_9, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_1();
											var div = $.first_child(fragment_5);
											var node_10 = $.child(div);

											FieldLabel(node_10, {
												get for() {
													return `password-${id}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Password');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div);

											var node_11 = $.sibling(div, 2);

											Input(node_11, {
												get id() {
													return `password-${id}`;
												},
												type: 'password',
												required: true
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_9, 2);

									Field(node_12, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_4();
											var node_13 = $.first_child(fragment_6);

											Button(node_13, {
												type: 'submit',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Login');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											var node_14 = $.sibling(node_13, 2);

											Button(node_14, {
												variant: 'outline',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();

													$.next();
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});

											var node_15 = $.sibling(node_14, 2);

											FieldDescription(node_15, {
												class: 'text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_3();

													$.next();
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							$.reset(form);
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
}