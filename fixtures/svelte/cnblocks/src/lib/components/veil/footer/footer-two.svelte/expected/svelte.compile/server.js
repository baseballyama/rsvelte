import * as $ from 'svelte/internal/server';
import { GitHub, Linkedin, Twitter } from "$lib/components/icons";
import Logo from "$lib/components/web/Logo.svelte";

export default function Footer_two($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
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

		$$renderer.push(`<footer class="@container border-t bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="flex flex-col items-center text-center"><a href="/" class="flex items-center gap-2">`);
		Logo($$renderer, { class: 'h-5' });
		$$renderer.push(`<!----></a> <nav class="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2"><!--[-->`);

		const each_array = $.ensure_array_like(links);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> <div class="mt-8 flex gap-4"><!--[-->`);

		const each_array_1 = $.ensure_array_like(social);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let item = each_array_1[$$index_1];

			$$renderer.push(`<a${$.attr('href', item.href)} class="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground"${$.attr('aria-label', item.label)}>`);

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

		$$renderer.push(`<!--]--></div> <p class="mt-8 text-sm text-muted-foreground">© ${$.escape(year)} Veil.</p></div></div></footer>`);
	});
}