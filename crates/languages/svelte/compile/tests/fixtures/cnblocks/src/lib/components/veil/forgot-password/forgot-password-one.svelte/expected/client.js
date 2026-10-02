import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bolt as Logo } from "$lib/svgs/index";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";
import { Input } from "$lib/components/ui/veil/input";
import { Label } from "$lib/components/ui/label";

var root = $.from_html(`<form action="" class="space-y-5"><div class="space-y-3"><!> <!></div> <!></form>`);
var root_1 = $.from_html(`<section class="flex grid min-h-screen grid-rows-[auto_1fr] bg-background px-4"><div class="mx-auto w-full max-w-7xl border-b py-3"><!></div> <div class="m-auto w-full max-w-sm"><div class="text-center"><h1 class="font-serif text-4xl font-medium">Forgot password?</h1> <p class="mt-2 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p></div> <!> <p class="mt-6 text-center text-sm text-muted-foreground">Remember your password? <!></p></div></section>`);

export default function Forgot_password_one($$anchor) {
	var section = root_1();
	var div = $.child(section);
	var node = $.child(div);

	Button(node, {
		href: '/',
		'aria-label': 'go home',
		variant: 'ghost',
		size: 'sm',
		class: 'inline-block h-auto border-t-2 border-transparent py-3 hover:bg-transparent',
		children: ($$anchor, $$slotProps) => {
			Logo($$anchor, { class: 'w-fit' });
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Card(node_1, {
		variant: 'outline',
		class: 'mt-6 p-8',
		children: ($$anchor, $$slotProps) => {
			var form = root();
			var div_2 = $.child(form);
			var node_2 = $.child(div_2);

			Label(node_2, {
				for: 'email',
				class: 'text-sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Email');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				type: 'email',
				id: 'email',
				name: 'email',
				placeholder: 'you@example.com',
				required: true
			});

			$.reset(div_2);

			var node_4 = $.sibling(div_2, 2);

			Button(node_4, {
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
			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_1, 2);
	var node_5 = $.sibling($.child(p));

	Button(node_5, {
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
	$.reset(div_1);
	$.reset(section);
	$.append($$anchor, section);
}