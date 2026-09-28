import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bolt as Logo } from "$lib/svgs/index";
import { Button } from "$lib/components/ui/veil/button";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";

var root = $.from_html(`<section class="flex min-h-screen bg-background px-4 py-16 md:py-24"><div class="m-auto w-full max-w-xs"><div class="text-center"><!> <h1 class="mt-3 font-serif text-4xl font-medium">Reset password</h1></div> <form action="" class="mt-12 space-y-4"><div class="space-y-2"><!> <!></div> <!></form> <p class="mt-8 text-center text-sm text-muted-foreground">Remember your password? <!></p></div></section>`);

export default function Forgot_password_three($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		href: '/',
		'aria-label': 'go home',
		variant: 'ghost',
		size: 'sm',
		class: 'inline-block h-auto py-3 hover:bg-transparent',
		children: ($$anchor, $$slotProps) => {
			Logo($$anchor, { class: 'mx-auto w-fit' });
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_1);

	var form = $.sibling(div_1, 2);
	var div_2 = $.child(form);
	var node_1 = $.child(div_2);

	Label(node_1, {
		for: 'email',
		class: 'text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		type: 'email',
		id: 'email',
		name: 'email',
		placeholder: 'you@example.com',
		required: true
	});

	$.reset(div_2);

	var node_3 = $.sibling(div_2, 2);

	Button(node_3, {
		class: 'w-full',
		type: 'submit',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Send Reset Link');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);

	var p = $.sibling(form, 2);
	var node_4 = $.sibling($.child(p));

	Button(node_4, {
		href: '/',
		variant: 'link',
		class: 'px-1 font-medium text-primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Sign in');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(p);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}