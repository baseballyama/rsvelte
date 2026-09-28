import * as $ from 'svelte/internal/server';

export default function Footer_four($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
			{ title: "Features", href: "#" },
			{ title: "Solution", href: "#" },
			{ title: "Customers", href: "#" },
			{ title: "Pricing", href: "#" },
			{ title: "Help", href: "#" },
			{ title: "About", href: "#" }
		];

		$$renderer.push(`<footer class="border-b bg-white py-12 dark:bg-transparent"><div class="mx-auto max-w-5xl px-6"><div class="flex flex-wrap justify-between gap-6"><span class="order-last block text-center text-sm text-muted-foreground md:order-first">© ${$.escape(new Date().getFullYear())} Tailus UI, All rights reserved</span> <div class="order-first flex flex-wrap justify-center gap-6 text-sm md:order-last"><!--[-->`);

		const each_array = $.ensure_array_like(links);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let link = each_array[index];

			$$renderer.push(`<a${$.attr('href', link.href)} class="block text-muted-foreground duration-150 hover:text-primary"><span>${$.escape(link.title)}</span></a>`);
		}

		$$renderer.push(`<!--]--></div></div></div></footer>`);
	});
}