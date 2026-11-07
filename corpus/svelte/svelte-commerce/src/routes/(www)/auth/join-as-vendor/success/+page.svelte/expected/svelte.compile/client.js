import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button/button.svelte';
import { goto } from '$app/navigation';

var root = $.from_html(`<div class="flex min-h-[70vh] items-center justify-center"><div class="w-full max-w-md space-y-8 rounded-lg bg-white p-6 text-center shadow-xl dark:bg-gray-800"><div class="space-y-4"><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Application Submitted Successfully!</h1> <div class="space-y-2"><p class="text-lg text-gray-600 dark:text-gray-300">Thank you for your interest!</p> <p class="text-xs text-gray-600 dark:text-gray-400">Your application has been received. Our onboarding team will contact you within 48 working hours to proceed with the verification process.</p></div> <div class="pt-4"><!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root();

	$.head('1a0kksl', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Signup Successful';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 4);
	var node = $.child(div_3);

	Button(node, {
		class: 'w-full',
		onclick: () => goto('/'),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Back to Home');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}