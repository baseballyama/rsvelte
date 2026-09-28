import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import GitHubIcon from "./github-icon.svelte";
import GoogleIcon from "./google-icon.svelte";
import LogoIcon from "./logo-icon.svelte";

var root = $.from_html(`<!> <span class="text-sm font-medium">Login with GitHub</span>`, 1);
var root_1 = $.from_html(`<!> <span class="text-sm font-medium">Login with Google</span>`, 1);
var root_2 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-md"><div class="flex items-center space-x-1.5"><!> <p class="text-lg font-medium text-foreground dark:text-foreground">Acme</p></div> <h3 class="mt-6 text-lg font-semibold text-foreground dark:text-foreground">Sign in to your account</h3> <p class="mt-2 text-sm text-muted-foreground dark:text-muted-foreground"> <a href="/" class="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Sign up</a></p> <div class="mt-8 flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"><!> <!></div> <div class="relative my-6"><div class="absolute inset-0 flex items-center"><!></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">or</span></div></div> <form action="#" method="post" class="mt-6 space-y-4"><div><!> <!></div> <div><!> <!></div> <!></form> <p class="mt-6 text-sm text-muted-foreground dark:text-muted-foreground"> <a href="/" class="font-medium text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90">Reset password</a></p></div></div></div>`);

export default function Login_04($$anchor) {
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	LogoIcon(node, {
		class: 'h-7 w-7 text-foreground dark:text-foreground',
		'aria-hidden': 'true'
	});

	$.next(2);
	$.reset(div_3);

	var p = $.sibling(div_3, 4);
	var text = $.child(p);

	text.nodeValue = 'Don\'t have an account?  ';
	$.next();
	$.reset(p);

	var div_4 = $.sibling(p, 2);
	var node_1 = $.child(div_4);

	Button(node_1, {
		variant: 'outline',
		class: 'flex-1 items-center justify-center space-x-2 py-2',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			GitHubIcon(node_2, { class: 'size-5', 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		variant: 'outline',
		class: 'mt-2 flex-1 items-center justify-center space-x-2 py-2 sm:mt-0',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_4 = $.first_child(fragment_1);

			GoogleIcon(node_4, { class: 'size-4', 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.child(div_5);
	var node_5 = $.child(div_6);

	Separator(node_5, { class: 'w-full' });
	$.reset(div_6);
	$.next(2);
	$.reset(div_5);

	var form = $.sibling(div_5, 2);
	var div_7 = $.child(form);
	var node_6 = $.child(div_7);

	Label(node_6, {
		for: 'email-login-04',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Email');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Input(node_7, {
		type: 'email',
		id: 'email-login-04',
		name: 'email-login-04',
		autocomplete: 'email',
		placeholder: 'ephraim@blocks.so',
		class: 'mt-2'
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_8 = $.child(div_8);

	Label(node_8, {
		for: 'password-login-04',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Password');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Input(node_9, {
		type: 'password',
		id: 'password-login-04',
		name: 'password-login-04',
		autocomplete: 'current-password',
		placeholder: '********',
		class: 'mt-2'
	});

	$.reset(div_8);

	var node_10 = $.sibling(div_8, 2);

	Button(node_10, {
		type: 'submit',
		class: 'mt-4 w-full py-2 font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Sign in');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var p_1 = $.sibling(form, 2);
	var text_4 = $.child(p_1);

	text_4.nodeValue = 'Forgot your password?  ';
	$.next();
	$.reset(p_1);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}