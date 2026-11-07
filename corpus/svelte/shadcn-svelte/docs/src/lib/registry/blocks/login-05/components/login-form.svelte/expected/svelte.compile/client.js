import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
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
var root = $.from_html(`Don't have an account? <a href="##">Sign up</a>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor"></path></svg> Continue with Apple`, 1);
var root_3 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg> Continue with Google`, 1);
var root_4 = $.from_html(`<div class="flex flex-col items-center gap-2 text-center"><a href="##" class="flex flex-col items-center gap-2 font-medium"><div class="flex size-8 items-center justify-center rounded-md"><!></div> <span class="sr-only">Acme Inc.</span></a> <h1 class="text-xl font-bold">Welcome to Acme Inc.</h1> <!></div> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`By clicking continue, you agree to our <a href="##">Terms of Service</a> and <a href="##">Privacy Policy</a>.`, 1);
var root_6 = $.from_html(`<div><form><!></form> <!></div>`);

export default function Login_form($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root_6();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex flex-col gap-6", $$props.class)]);

	var form = $.child(div);
	var node = $.child(form);

	FieldGroup(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var div_1 = $.first_child(fragment);
			var a = $.child(div_1);
			var div_2 = $.child(a);
			var node_1 = $.child(div_2);

			GalleryVerticalEndIcon(node_1, { class: 'size-6' });
			$.reset(div_2);
			$.next(2);
			$.reset(a);

			var node_2 = $.sibling(a, 4);

			FieldDescription(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();

					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			Field(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_4 = $.first_child(fragment_2);

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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_3, 2);

			Field(node_6, {
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						type: 'submit',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Login');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			FieldSeparator(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Or');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Field(node_8, {
				class: 'grid gap-4 sm:grid-cols-2',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_9 = $.first_child(fragment_4);

					Button(node_9, {
						variant: 'outline',
						type: 'button',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();

							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Button(node_10, {
						variant: 'outline',
						type: 'button',
						children: ($$anchor, $$slotProps) => {
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

	var node_11 = $.sibling(form, 2);

	FieldDescription(node_11, {
		class: 'px-6 text-center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_7 = root_5();

			$.next(4);
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}