import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent } from "$lib/components/ui/card";
import { Input } from "$lib/components/ui/input";
import { Separator } from "$lib/components/ui/separator";
import LogoIcon from "./logo-icon.svelte";

var root = $.from_html(`<div class="flex flex-col items-center space-y-8"><!> <div class="space-y-2 text-center"><h1 class="text-3xl font-semibold text-foreground">Welcome back!</h1> <p class="text-sm text-muted-foreground"> <a href="/" class="text-foreground hover:underline">Sign up for free</a></p></div> <div class="w-full space-y-4"><!> <div class="flex flex-col gap-2"><!> <!></div> <div class="flex items-center gap-4 py-2"><!> <span class="text-sm text-muted-foreground">OR</span> <!></div> <!></div> <p class="w-11/12 text-center text-xs text-muted-foreground"> <a href="/" class="underline hover:text-foreground">Terms of Service</a> <a href="/" class="underline hover:text-foreground">Privacy Policy</a> .</p></div>`);
var root_1 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><!></div>`);

export default function Login_06($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Card(node, {
		class: 'w-full max-w-sm rounded-4xl px-6 py-10 pt-14',
		children: ($$anchor, $$slotProps) => {
			CardContent($$anchor, {
				class: '',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();
					var node_1 = $.child(div_1);

					LogoIcon(node_1, {});

					var div_2 = $.sibling(node_1, 2);
					var p = $.sibling($.child(div_2), 2);
					var text = $.child(p);

					text.nodeValue = 'First time here?  ';
					$.next();
					$.reset(p);
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var node_2 = $.child(div_3);

					Input(node_2, {
						type: 'email',
						placeholder: 'Your email',
						class: 'w-full rounded-xl'
					});

					var div_4 = $.sibling(node_2, 2);
					var node_3 = $.child(div_4);

					Button(node_3, {
						class: 'w-full rounded-xl',
						size: 'lg',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Send me the magic link');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						variant: 'link',
						class: 'w-full text-sm text-muted-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Sign in using password');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_5 = $.child(div_5);

					Separator(node_5, { class: 'flex-1' });

					var node_6 = $.sibling(node_5, 4);

					Separator(node_6, { class: 'flex-1' });
					$.reset(div_5);

					var node_7 = $.sibling(div_5, 2);

					Button(node_7, {
						variant: 'outline',
						class: 'w-full rounded-xl',
						size: 'lg',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Single sign-on (SSO)');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_3);

					var p_1 = $.sibling(div_3, 2);
					var text_4 = $.child(p_1);

					text_4.nodeValue = 'You acknowledge that you read, and agree, to our  ';

					var text_5 = $.sibling(text_4, 2);

					text_5.nodeValue = ' \n					and our  ';
					$.next(2);
					$.reset(p_1);
					$.reset(div_1);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}