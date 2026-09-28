import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent } from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import LogoIcon from "./logo-icon.svelte";

var root = $.from_html(`<form action="#" method="post" class="space-y-4"><div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div class="mt-2 flex items-start"><div class="flex h-6 items-center"><!></div> <!></div> <!> <p class="text-center text-xs text-muted-foreground dark:text-muted-foreground"> <a href="/" class="text-primary capitalize hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Terms of use</a> <a href="/" class="text-primary capitalize hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Privacy policy</a></p></form>`);
var root_1 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-md"><!> <h3 class="mt-2 text-center text-lg font-bold text-foreground dark:text-foreground">Create new account for workspace</h3></div> <!> <p class="mt-6 text-center text-sm text-muted-foreground dark:text-muted-foreground"> <a href="/" class="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Sign in</a></p></div></div>`);

export default function Login_05($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	LogoIcon(node, {
		class: 'mx-auto h-10 w-10 text-foreground dark:text-foreground',
		'aria-hidden': 'true'
	});

	$.next(2);
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	Card(node_1, {
		class: 'mt-4 sm:mx-auto sm:w-full sm:max-w-md',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var form = root();
					var div_3 = $.child(form);
					var node_2 = $.child(div_3);

					Label(node_2, {
						for: 'name-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Name');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Input(node_3, {
						type: 'text',
						id: 'name-login-05',
						name: 'name-login-05',
						autocomplete: 'name',
						placeholder: 'Name',
						class: 'mt-2'
					});

					$.reset(div_3);

					var div_4 = $.sibling(div_3, 2);
					var node_4 = $.child(div_4);

					Label(node_4, {
						for: 'email-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Email');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Input(node_5, {
						type: 'email',
						id: 'email-login-05',
						name: 'email-login-05',
						autocomplete: 'email',
						placeholder: 'ephraim@blocks.so',
						class: 'mt-2'
					});

					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_6 = $.child(div_5);

					Label(node_6, {
						for: 'password-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Password');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Input(node_7, {
						type: 'password',
						id: 'password-login-05',
						name: 'password-login-05',
						autocomplete: 'new-password',
						placeholder: 'Password',
						class: 'mt-2'
					});

					$.reset(div_5);

					var div_6 = $.sibling(div_5, 2);
					var node_8 = $.child(div_6);

					Label(node_8, {
						for: 'confirm-password-login-05',
						class: 'text-sm font-medium text-foreground dark:text-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Confirm password');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					Input(node_9, {
						type: 'password',
						id: 'confirm-password-login-05',
						name: 'confirm-password-login-05',
						autocomplete: 'new-password',
						placeholder: 'Password',
						class: 'mt-2'
					});

					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var div_8 = $.child(div_7);
					var node_10 = $.child(div_8);

					Checkbox(node_10, {
						id: 'newsletter-login-05',
						name: 'newsletter-login-05',
						class: 'size-4'
					});

					$.reset(div_8);

					var node_11 = $.sibling(div_8, 2);

					Label(node_11, {
						for: 'newsletter-login-05',
						class: 'ml-3 text-sm leading-6 text-muted-foreground dark:text-muted-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Sign up to our newsletter');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);

					var node_12 = $.sibling(div_7, 2);

					Button(node_12, {
						type: 'submit',
						class: 'mt-4 w-full py-2 font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Create account');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var p = $.sibling(node_12, 2);
					var text_6 = $.child(p);

					text_6.nodeValue = 'By signing in, you agree to our  ';

					var text_7 = $.sibling(text_6, 2);

					text_7.nodeValue = ' \n						and  ';
					$.next();
					$.reset(p);
					$.reset(form);
					$.append($$anchor, form);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var p_1 = $.sibling(node_1, 2);
	var text_8 = $.child(p_1);

	text_8.nodeValue = 'Already have an account?  ';
	$.next();
	$.reset(p_1);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}