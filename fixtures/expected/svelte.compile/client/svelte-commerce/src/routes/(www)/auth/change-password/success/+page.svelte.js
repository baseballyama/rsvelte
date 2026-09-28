import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { showAuthModal } from '$lib/core/components/index.js';
import { Button } from '$lib/components/ui/button/index.js';
import { CheckCircle2 } from '@lucide/svelte';

var root = $.from_html(`<div class="flex min-h-screen w-full items-center justify-center"><div class="mx-auto w-full max-w-md p-4"><div class="mb-8 text-center"><div class="mb-4 flex justify-center"><!></div> <h1 class="mb-2 text-2xl font-bold">Password Changed Successfully!</h1> <p class="text-sm text-gray-600">Your password has been updated. You can now log in with your new password.</p></div> <div class="flex justify-center"><!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	CheckCircle2(node, { class: 'h-16 w-16 text-green-500' });
	$.reset(div_3);
	$.next(4);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_1 = $.child(div_4);

	Button(node_1, {
		class: 'w-full',
		onclick: () => {
			showAuthModal('login');
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Go to Login');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}