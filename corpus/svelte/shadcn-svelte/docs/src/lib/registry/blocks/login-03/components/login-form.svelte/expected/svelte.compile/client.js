import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	FieldGroup,
	Field,
	FieldLabel,
	FieldDescription,
	FieldSeparator
} from "$lib/registry/ui/field/index.js";

import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor"></path></svg> Login with Apple`, 1);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg> Login with Google`, 1);
var root_3 = $.from_html(`<div class="flex items-center"><!> <a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> <!>`, 1);
var root_4 = $.from_html(`Don't have an account? <a href="##">Sign up</a>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<form><!></form>`);
var root_7 = $.from_html(`By clicking continue, you agree to our <a href="##">Terms of Service</a> and <a href="##">Privacy Policy</a>.`, 1);
var root_8 = $.from_html(`<div><!> <!></div>`);

export default function Login_form($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_8();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex flex-col gap-6", $$props.class)]);

	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'text-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Welcome back');

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

										var text_1 = $.text('Login with your Apple or Google account');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_6();
							var node_5 = $.child(form);

							FieldGroup(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_5();
									var node_6 = $.first_child(fragment_2);

									Field(node_6, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_7 = $.first_child(fragment_3);

											Button(node_7, {
												variant: 'outline',
												type: 'button',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();

													$.next();
													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});

											var node_8 = $.sibling(node_7, 2);

											Button(node_8, {
												variant: 'outline',
												type: 'button',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_2();

													$.next();
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_6, 2);

									FieldSeparator(node_9, {
										class: '*:data-[slot=field-separator-content]:bg-card',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Or continue with');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Field(node_10, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_11 = $.first_child(fragment_6);

											FieldLabel(node_11, {
												get for() {
													return `email-${id}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Email');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											var node_12 = $.sibling(node_11, 2);

											Input(node_12, {
												get id() {
													return `email-${id}`;
												},
												type: 'email',
												placeholder: 'm@example.com',
												required: true
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_10, 2);

									Field(node_13, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_3();
											var div_1 = $.first_child(fragment_7);
											var node_14 = $.child(div_1);

											FieldLabel(node_14, {
												get for() {
													return `password-${id}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Password');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_1);

											var node_15 = $.sibling(div_1, 2);

											Input(node_15, {
												get id() {
													return `password-${id}`;
												},
												type: 'password',
												required: true
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									var node_16 = $.sibling(node_13, 2);

									Field(node_16, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root();
											var node_17 = $.first_child(fragment_8);

											Button(node_17, {
												type: 'submit',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Login');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_18 = $.sibling(node_17, 2);

											FieldDescription(node_18, {
												class: 'text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_9 = root_4();

													$.next();
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});

							$.reset(form);
							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_19 = $.sibling(node, 2);

	FieldDescription(node_19, {
		class: 'px-6 text-center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_10 = root_7();

			$.next(4);
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}