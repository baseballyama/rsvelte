import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Separator } from "$lib/components/ui/separator";
import GoogleIcon from "./google-icon.svelte";

var root = $.from_html(`<a href="/"><!> <span class="text-sm font-medium">Sign in with Google</span></a>`);
var root_1 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6"><div class="sm:mx-auto sm:w-full sm:max-w-sm"><h2 class="text-center text-xl font-semibold text-foreground">Log in or create account</h2> <form action="#" method="post" class="mt-6"><!> <!> <!></form> <div class="relative my-6"><div class="absolute inset-0 flex items-center"><!></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">or with</span></div></div> <!> <p class="mt-4 text-xs text-muted-foreground"> <a href="/" class="underline underline-offset-4">terms of service</a> <a href="/" class="underline underline-offset-4">privacy policy</a> .</p></div></div></div>`);

export default function Login_01($$anchor) {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var form = $.sibling($.child(div_2), 2);
	var node = $.child(form);

	Label(node, {
		for: 'email',
		class: 'font-medium text-foreground',
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
		id: 'email',
		name: 'email',
		autocomplete: 'email',
		placeholder: 'john@company.com',
		class: 'mt-2'
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		type: 'submit',
		class: 'mt-4 w-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Sign in');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var div_3 = $.sibling(form, 2);
	var div_4 = $.child(div_3);
	var node_3 = $.child(div_4);

	Separator(node_3, { class: 'w-full' });
	$.reset(div_4);
	$.next(2);
	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	Button(node_4, {
		variant: 'outline',
		class: 'inline-flex w-full items-center justify-center space-x-2',
		children: ($$anchor, $$slotProps) => {
			var a = root();
			var node_5 = $.child(a);

			GoogleIcon(node_5, { class: 'size-5', 'aria-hidden': true });
			$.next(2);
			$.reset(a);
			$.append($$anchor, a);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_4, 2);
	var text_2 = $.child(p);

	text_2.nodeValue = 'By signing in, you agree to our  ';

	var text_3 = $.sibling(text_2, 2);

	text_3.nodeValue = ' \n				and  ';
	$.next(2);
	$.reset(p);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}