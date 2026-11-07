import * as $ from 'svelte/internal/server';
import { CheckCircle2 } from '@lucide/svelte';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button';
import { goto } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const enquiryPlugin = $.derived(() => page.data?.store?.plugins?.enquiryMode);

		$.head('1wrvx77', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Enquiry Submitted Successfully</title>`);
			});
		});

		$$renderer.push(`<div class="min-h-screen bg-gray-50 py-12"><div class="container mx-auto max-w-3xl px-4"><div class="rounded-lg bg-white p-6 shadow-lg md:p-8"><div class="mb-8 text-center"><div class="mb-4 flex justify-center"><div class="rounded-full bg-green-100 p-3">`);
		CheckCircle2($$renderer, { class: 'h-12 w-12 text-green-500' });
		$$renderer.push(`<!----></div></div> <h1 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">${$.escape(enquiryPlugin()?.successHeader || 'Thank You For Your Enquiry!')}</h1> <p class="text-gray-600">${$.escape(enquiryPlugin()?.successMessage || 'We will get back to you soon!')}</p> `);

		Button($$renderer, {
			class: 'mt-5',
			onclick: () => goto('/products'),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Continue Shopping`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div></div>`);
	});
}