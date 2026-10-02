import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center"><!> <a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> <!>`, 1);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"></path></svg> Login with GitHub`, 1);
var root_3 = $.from_html(`Don't have an account? <a href="##" class="underline underline-offset-4">Sign up</a>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col items-center gap-1 text-center"><h1 class="text-2xl font-bold">Login to your account</h1> <p class="text-sm text-balance text-muted-foreground">Enter your email below to login to your account</p></div> <!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<form><!></form>`);

export default function Login_form($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var form = root_5();

	$.attribute_effect(form, ($0) => ({ class: $0, ...restProps }), [() => cn("flex flex-col gap-6", $$props.class)]);

	var node = $.child(form);

	FieldGroup(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_1 = $.sibling($.first_child(fragment), 2);

			Field(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					FieldLabel(node_2, {
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

					var node_3 = $.sibling(node_2, 2);

					Input(node_3, {
						get id() {
							return `email-${id}`;
						},
						type: 'email',
						placeholder: 'm@example.com',
						required: true
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Field(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var div = $.first_child(fragment_2);
					var node_5 = $.child(div);

					FieldLabel(node_5, {
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
					$.reset(div);

					var node_6 = $.sibling(div, 2);

					Input(node_6, {
						get id() {
							return `password-${id}`;
						},
						type: 'password',
						required: true
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_4, 2);

			Field(node_7, {
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

			var node_8 = $.sibling(node_7, 2);

			FieldSeparator(node_8, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Or continue with');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Field(node_9, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_10 = $.first_child(fragment_4);

					Button(node_10, {
						variant: 'outline',
						type: 'button',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();

							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					FieldDescription(node_11, {
						class: 'text-center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_6 = root_3();

							$.next();
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.bind_this(form, ($$value) => ref($$value), () => ref());
	$.append($$anchor, form);
	$.pop();
}