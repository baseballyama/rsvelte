import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import Button from '$lib/components/ui/button/button.svelte';
import { ShoppingBag, Home, ArrowLeft, Search, Package, Tag } from '@lucide/svelte';
import { goto } from '$app/navigation';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let searchQuery = '';

		function handleSearch() {
			if (searchQuery.trim()) {
				goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
			}
		}

		SeoHeader($$renderer, { metaTitle: `Error ${page.status}`, noindex: true });
		$$renderer.push(`<!----> <div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4"><div class="max-w-2xl text-center"><div class="mb-4 flex justify-center">`);
		ShoppingBag($$renderer, { class: 'h-24 w-24 animate-bounce text-primary' });
		$$renderer.push(`<!----></div> <h1 class="mb-2 text-6xl font-bold text-primary">${$.escape(page.status)}</h1> <h2 class="mb-8 text-2xl font-semibold text-gray-600">${$.escape(page.error?.message || 'Something went wrong')}</h2> <p class="mb-8 text-gray-500">`);

		if (page.status === 404) {
			$$renderer.push(`<!--[0-->The page you're looking for doesn't exist.`);
		} else {
			$$renderer.push(`<!--[-1-->We encountered an unexpected error. Our team has been notified.`);
		}

		$$renderer.push(`<!--]--></p> <div class="mb-8"><form class="mx-auto max-w-md"><div class="relative">`);

		Search($$renderer, {
			class: 'absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
		});

		$$renderer.push(`<!----> <input type="text"${$.attr('value', searchQuery)} placeholder="Search for products..." class="w-full rounded-lg border border-gray-300 px-10 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"/> `);

		Button($$renderer, {
			type: 'submit',
			class: 'absolute right-2 top-1/2 -translate-y-1/2',
			onclick: () => handleSearch(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Search`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></form></div> <div class="mb-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600"><a href="/" class="transition-colors hover:text-primary">Home</a> <span>•</span> <a href="/categories" class="transition-colors hover:text-primary">Categories</a> <span>•</span> <a href="/products" class="transition-colors hover:text-primary">All Products</a> <span>•</span> <a href="/contact-us" class="transition-colors hover:text-primary">Contact Us</a></div> <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">`);

		Button($$renderer, {
			variant: 'outline',
			class: 'gap-2',
			onclick: () => {
				goto('/');
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