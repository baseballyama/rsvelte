import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import EyeIcon from "@lucide/svelte/icons/eye";
import EyeOffIcon from "@lucide/svelte/icons/eye-off";
import Key from "@lucide/svelte/icons/key";
import LogoIcon from "./logo-icon.svelte";

var root = $.from_html(`<div class="flex justify-center"><!></div> <div><h2 class="text-2xl font-semibold">Sign in to Acme</h2> <p class="text-sm text-muted-foreground">Welcome back! Please enter your details.</p></div>`, 1);
var root_1 = $.from_html(`<!> Single sign-on (SSO)`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><!> <!></div> <div class="space-y-0"><div class="mb-2 flex items-center justify-between"><!> <a href="/" class="text-sm text-primary hover:underline">Reset password</a></div> <div class="relative"><!> <button class="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button" aria-controls="password"><!></button></div></div> <div class="flex items-center space-x-2"><!> <!></div> <div class="space-y-2"><!> <!></div>`, 1);
var root_3 = $.from_html(`<p class="text-center text-sm text-muted-foreground"> <a href="/" class="text-primary hover:underline">Sign up</a></p>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><!></div>`);

export default function Login_08($$anchor) {
	let isPasswordVisible = $.state(false);

	const togglePasswordVisibility = () => {
		$.set(isPasswordVisible, !$.get(isPasswordVisible));
	};

	var div = root_5();
	var node = $.child(div);

	Card(node, {
		class: 'mx-4 w-full max-w-md pb-0',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_1 = $.first_child(fragment);

			CardHeader(node_1, {
				class: 'mt-4 mb-2 space-y-1 text-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var div_1 = $.first_child(fragment_1);
					var node_2 = $.child(div_1);

					LogoIcon(node_2, {});
					$.reset(div_1);
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			CardContent(node_3, {
				class: 'space-y-6',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var div_2 = $.first_child(fragment_2);
					var node_4 = $.child(div_2);

					Label(node_4, {
						for: 'email',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Email address');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Input(node_5, { id: 'email', type: 'email', placeholder: 'ephraim@blocks.so' });
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var div_4 = $.child(div_3);
					var node_6 = $.child(div_4);

					Label(node_6, {
						for: 'password',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Password');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.next(2);
					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_7 = $.child(div_5);

					{
						let $0 = $.derived(() => $.get(isPasswordVisible) ? "text" : "password");

						Input(node_7, {
							id: 'password',
							class: 'pe-9',
							placeholder: 'Enter your password',
							get type() {
								return $.get($0);
							}
						});
					}

					var button = $.sibling(node_7, 2);
					var node_8 = $.child(button);

					{
						var consequent = ($$anchor) => {
							EyeOffIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
						};

						var alternate = ($$anchor) => {
							EyeIcon($$anchor, { size: 16, 'aria-hidden': 'true' });
						};

						$.if(node_8, ($$render) => {
							if ($.get(isPasswordVisible)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.reset(button);
					$.reset(div_5);
					$.reset(div_3);

					var div_6 = $.sibling(div_3, 2);
					var node_9 = $.child(div_6);

					Checkbox(node_9, { id: 'remember', checked: true });

					var node_10 = $.sibling(node_9, 2);

					Label(node_10, {
						for: 'remember',
						class: 'text-sm font-normal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Remember me');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var node_11 = $.child(div_7);

					Button(node_11, {
						class: 'w-full',
						type: 'submit',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Sign In');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Button(node_12, {
						variant: 'outline',
						class: 'w-full',
						type: 'button',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_1();
							var node_13 = $.first_child(fragment_5);

							Key(node_13, { class: 'mr-2 h-4 w-4' });
							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);

					$.template_effect(() => {
						$.set_attribute(button, 'aria-label', $.get(isPasswordVisible) ? "Hide password" : "Show password");
						$.set_attribute(button, 'aria-pressed', $.get(isPasswordVisible));
					});

					$.delegated('click', button, togglePasswordVisibility);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_3, 2);

			CardFooter(node_14, {
				class: 'flex justify-center border-t py-4!',
				children: ($$anchor, $$slotProps) => {
					var p = root_3();
					var text_4 = $.child(p);

					text_4.nodeValue = 'New to Acme?  ';
					$.next();
					$.reset(p);
					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}

$.delegate(['click']);