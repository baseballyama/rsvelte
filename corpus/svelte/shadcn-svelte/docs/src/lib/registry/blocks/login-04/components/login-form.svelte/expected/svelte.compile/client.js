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
var root_1 = $.from_html(`<div class="flex items-center"><!> <a href="##" class="ms-auto text-sm underline-offset-2 hover:underline">Forgot your password?</a></div> <!>`, 1);
var root_2 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor"></path></svg> <span class="sr-only">Login with Apple</span>`, 1);
var root_3 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg> <span class="sr-only">Login with Google</span>`, 1);
var root_4 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" fill="currentColor"></path></svg> <span class="sr-only">Login with Meta</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`Don't have an account? <a href="##">Sign up</a>`, 1);
var root_7 = $.from_html(`<div class="flex flex-col items-center gap-2 text-center"><h1 class="text-2xl font-bold">Welcome back</h1> <p class="text-balance text-muted-foreground">Login to your Acme Inc account</p></div> <!> <!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<form class="p-6 md:p-8"><!></form> <div class="relative hidden bg-muted md:block"><img src="/placeholder.svg" alt="placeholder" class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"/></div>`, 1);
var root_9 = $.from_html(`By clicking continue, you agree to our <a href="##">Terms of Service</a> and <a href="##">Privacy Policy</a>.`, 1);
var root_10 = $.from_html(`<div><!> <!></div>`);

export default function Login_form($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_10();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex flex-col gap-6", $$props.class)]);

	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'overflow-hidden p-0',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'grid p-0 md:grid-cols-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_8();
							var form = $.first_child(fragment_1);
							var node_2 = $.child(form);

							FieldGroup(node_2, {
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_7();
									var node_3 = $.sibling($.first_child(fragment_2), 2);

									Field(node_3, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_4 = $.first_child(fragment_3);

											FieldLabel(node_4, {
												get for() {
													return `email-${id}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Email');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});

											var node_5 = $.sibling(node_4, 2);

											Input(node_5, {
												get id() {
													return `email-${id}`;
												},
												type: 'email',
												placeholder: 'm@example.com',
												required: true
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_3, 2);

									Field(node_6, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var div_1 = $.first_child(fragment_4);
											var node_7 = $.child(div_1);

											FieldLabel(node_7, {
												get for() {
													return `password-${id}`;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Password');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});

											$.next(2);
											$.reset(div_1);

											var node_8 = $.sibling(div_1, 2);

											Input(node_8, {
												get id() {
													return `password-${id}`;
												},
												type: 'password',
												required: true
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_6, 2);

									Field(node_9, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												type: 'submit',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Login');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									FieldSeparator(node_10, {
										class: '*:data-[slot=field-separator-content]:bg-card',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Or continue with');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									Field(node_11, {
										class: 'grid grid-cols-3 gap-4',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_5();
											var node_12 = $.first_child(fragment_6);

											Button(node_12, {
												variant: 'outline',
												type: 'button',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();

													$.next(2);
													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});

											var node_13 = $.sibling(node_12, 2);

											Button(node_13, {
												variant: 'outline',
												type: 'button',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root_3();

													$.next(2);
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});

											var node_14 = $.sibling(node_13, 2);

											Button(node_14, {
												variant: 'outline',
												type: 'button',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_4();

													$.next(2);
													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_11, 2);

									FieldDescription(node_15, {
										class: 'text-center',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_10 = root_6();

											$.next();
											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});

							$.reset(form);
							$.next(2);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node, 2);

	FieldDescription(node_16, {
		class: 'px-6 text-center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_11 = root_9();

			$.next(4);
			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}