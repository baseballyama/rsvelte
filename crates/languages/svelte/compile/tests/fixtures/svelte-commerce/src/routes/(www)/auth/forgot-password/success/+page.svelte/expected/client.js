import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { Mail } from '@lucide/svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';

var root = $.from_html(`<div class="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4"><div class="w-full space-y-6 text-center"><div class="flex flex-col items-center space-y-4"><div class="rounded-full bg-gray-100 p-3"><!></div> <div class="space-y-2"><h1 class="text-2xl font-bold tracking-tight">Check your email</h1> <p class="text-gray-500">We've sent you a password reset link. Please check your email and follow the instructions to reset your password.</p></div></div> <div class="space-y-4"><!></div></div></div>`);

export default function _page($$anchor) {
	var div = root();

	$.head('xmrv2a', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Forgot Password';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Mail(node, { class: 'h-6 w-6 text-gray-600' });
	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_1 = $.child(div_4);

	AuthButton(node_1, {
		type: 'login',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				variant: 'outline',
				class: 'w-full',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Back to Login');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}