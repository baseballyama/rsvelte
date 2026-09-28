import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bolt as Logo } from "$lib/svgs/index";
import { Button } from "$lib/components/ui/veil/button";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";

var root = $.from_html(`<section class="flex min-h-screen bg-background px-4 py-16 md:py-24"><div class="m-auto w-full max-w-sm rounded-2xl border bg-muted p-8"><div><!> <h1 class="mt-6 font-serif text-2xl font-medium">Forgot password?</h1> <p class="mt-1 text-sm text-muted-foreground">No worries, we'll send you reset instructions</p></div> <form action="" class="mt-8 space-y-5"><div class="space-y-2"><!> <!></div> <!></form> <p class="mt-8 text-center text-sm text-muted-foreground">Remember your password? <!></p></div></section>`);

export default function Forgot_password_two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Button(node, {
		href: '/',
		'aria-label': 'go home',
		variant: 'ghost',
		size: 'sm',
		class: 'h-auto p-0 hover:bg-transparent',
		children: ($$anchor, $$slotProps) => {
			Logo($$anchor, { class: 'h-6 w-fit' });
		},
		$$slots: { default: true }
	});

	$.next(4);
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