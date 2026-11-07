import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import GoogleIcon from "./google-icon.svelte";

var root = $.from_html(`<!> <span class="text-sm font-medium">Sign in with Google</span>`, 1);
var root_1 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-sm"><h2 class="text-center text-xl font-semibold text-foreground">Log in or create account</h2> <form action="#" method="post" class="mt-6 space-y-4"><div><!> <!></div> <div><!> <!></div> <!></form> <div class="relative my-6"><div class="absolute inset-0 flex items-center"><!></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">or with</span></div></div> <!> <p class="mt-4 text-xs text-muted-foreground dark:text-muted-foreground"> <a href="/" class="underline underline-offset-4">terms of service</a> <a href="/" class="underline underline-offset-4">privacy policy</a> .</p></div></div></div>`);

export default function Login_02($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var form = $.sibling($.child(div_2), 2);
	var div_3 = $.child(form);
	var node = $.child(div_3);

	Label(node, {
		for: 'email-login-02',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		type: 'email',
		id: 'email-login-02',
		name: 'email-login-02',
		autocomplete: 'email',
		placeholder: 'ephraim@blocks.so',
		class: 'mt-2'
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	Label(node_2, {
		for: 'password-login-02',
		class: 'text-sm font-medium text-foreground dark:text-foreground',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Password');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Input(node_3, {
		type: 'password',
		id: 'password-login-02',
		name: 'password-login-02',
		autocomplete: 'current-password',
		placeholder: '**************',
		class: 'mt-2'
	});

	$.reset(div_4);

	var node_4 = $.sibling(div_4, 2);

	Button(node_4, {
		type: 'submit',
		class: 'mt-4 w-full py-2 font-medium',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Sign in');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var div_5 = $.sibling(form, 2);
	var div_6 = $.child(div_5);
	var node_5 = $.child(div_6);

	Separator(node_5, { class: 'w-full' });
	$.reset(div_6);
	$.next(2);
	$.reset(div_5);

	var node_6 = $.sibling(div_5, 2);

	Button(node_6, {
		variant: 'outline',
		class: 'flex w-full items-center justify-center space-x-2 py-2',
		href: '/',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_7 = $.first_child(fragment);

			GoogleIcon(node_7, { class: 'size-5', 'aria-hidden': 'true' });
			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_6, 2);
	var text_3 = $.child(p);

	text_3.nodeValue = 'By signing in, you agree to our  ';

	var text_4 = $.sibling(text_3, 2);

	text_4.nodeValue = ' \n				and  ';
	$.next(2);
	$.reset(p);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}