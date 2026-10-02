import * as $ from 'svelte/internal/server';
import Logo from "$lib/components/web/Logo.svelte";
import { GitHub, Linkedin, Twitter } from "$lib/components/icons";

export default function Footer_four($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
			{ label: "Home", href: "#" },
			{ label: "Features", href: "#" },
			{ label: "Pricing", href: "#" },
			{ label: "About", href: "#" },
			{ label: "Blog", href: "#" },
			{ label: "Contact", href: "#" }
		];

		const social = [
			{ icon: Twitter, href: "#", label: "Twitter" },
			{ icon: GitHub, href: "#", label: "GitHub" },
			{ icon: Linkedin, href: "#", label: "LinkedIn" }
		];

		const year = new Date().getFullYear();

		$$renderer.push(`<footer class="@container border-t bg-background py-12"><div class="mx-auto max-w-3xl px-6"><div class="grid gap-8"><div class="col-span-full border-b pb-8"><a href="/" class="flex items-center gap-2">`);
		Logo($$renderer, { class: 'h-5 w-fit' });
		$$renderer.push(`<!----></a> <p class="mt-4 max-w-xs text-sm text-muted-foreground">The modern integration platform for teams who ship fast.</p> <div class="mt-6 -ml-2 flex"><!--[-->`);

		const each_array = $.ensure_array_like(social);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', item.href)} class="flex size-8 text-muted-foreground transition-colors *:m-auto hover:text-foreground"${$.attr('aria-label', item.label)}>`);

			if (item.icon) {
				$$renderer.push('<!--[-->');
				item.icon($$renderer, { class: 'size-4' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</a>`);
		}

		$$renderer.push(`<!--]--></div></div> <nav class="flex flex-wrap gap-x-8 gap-y-3"><!--[-->`);

		const each_array_1 = $.ensure_array_like(links);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let link = each_array_1[$$index_1];

			$$renderer.push(`<a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> <div class="border-t pt-8"><p class="text-sm text-muted-foreground">© ${$.escape(year)} Veil, Inc. All rights reserved.</p></div></div></div></footer>`);
	});
}