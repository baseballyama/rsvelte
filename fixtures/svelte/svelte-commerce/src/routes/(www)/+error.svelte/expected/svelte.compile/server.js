import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Button from '$lib/components/ui/button/button.svelte';
import { ShoppingBag, Home, ArrowLeft } from '@lucide/svelte';
import { goto } from '$app/navigation';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		SeoHeader($$renderer, { metaTitle: `Error ${page.status}`, noindex: true });
		$$renderer.push(`<!----> <div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4"><div class="text-center"><div class="mb-4 flex justify-center">`);
		ShoppingBag($$renderer, { class: 'h-24 w-24 animate-bounce text-primary' });
		$$renderer.push(`<!----></div> <h1 class="mb-2 text-6xl font-bold text-primary">${$.escape(page.status)}</h1> <h2 class="mb-8 text-2xl font-semibold text-gray-600">${$.escape(page.error?.message || 'Something went wrong')}</h2> <p class="mb-8 text-gray-500">`);

		if (page.status === 404) {
			$$renderer.push(`<!--[0-->The page you're looking for doesn't exist.`);
		} else {
			$$renderer.push(`<!--[-1-->We encountered an unexpected error. Our team has been notified.`);
		}

		$$renderer.push(`<!--]--></p> <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">`);

		Button($$renderer, {
			variant: 'outline',
			class: 'gap-2',
			onclick: () => {
				// if (window.history?.length > 1) {
				// 	window.history.back()
				// } else {
				goto('/');

				// }
			},

			children: ($$renderer) => {
				ArrowLeft($$renderer, { class: 'h-4 w-4' });
				$$renderer.push(`<!----> Go Back`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			class: 'gap-2',
			onclick: () => goto('/'),
			children: ($$renderer) => {
				Home($$renderer, { class: 'h-4 w-4' });
				$$renderer.push(`<!----> Return Home`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div>`);
	});
}