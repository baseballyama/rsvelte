import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CheckCircle2 } from '@lucide/svelte';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button';
import { goto } from '$app/navigation';

var root = $.from_html(`<div class="min-h-screen bg-gray-50 py-12"><div class="container mx-auto max-w-3xl px-4"><div class="rounded-lg bg-white p-6 shadow-lg md:p-8"><div class="mb-8 text-center"><div class="mb-4 flex justify-center"><div class="rounded-full bg-green-100 p-3"><!></div></div> <h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl"> </h1> <p class="text-gray-600"> </p> <!></div></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const enquiryPlugin = $.derived(() => page.data?.store?.plugins?.enquiryMode);
	var div = root();

	$.head('1wrvx77', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Enquiry Submitted Successfully';
		});
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node = $.child(div_5);

	CheckCircle2(node, { class: 'h-12 w-12 text-green-500' });
	$.reset(div_5);
	$.reset(div_4);

	var h1 = $.sibling(div_4, 2);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);
	var node_1 = $.sibling(p, 2);

	Button(node_1, {
		class: 'mt-5',
		onclick: () => goto('/products'),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Continue Shopping');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $.get(enquiryPlugin)?.successHeader || 'Thank You For Your Enquiry!');
		$.set_text(text_1, $.get(enquiryPlugin)?.successMessage || 'We will get back to you soon!');
	});

	$.append($$anchor, div);
	$.pop();
}