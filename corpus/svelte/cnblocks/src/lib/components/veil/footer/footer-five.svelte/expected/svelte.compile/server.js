import * as $ from 'svelte/internal/server';
import Logo from "$lib/components/web/Logo.svelte";
import ThemeSwitcher from "./theme-switcher.svelte";

export default function Footer_five($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
			{ label: "Features", href: "#" },
			{ label: "Pricing", href: "#" },
			{ label: "About", href: "#" },
			{ label: "Blog", href: "#" },
			{ label: "Contact", href: "#" }
		];

		const year = new Date().getFullYear();

		$$renderer.push(`<footer class="@container bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="flex flex-col"><a href="/" aria-label="go home" class="-ml-1.5 flex size-8 rounded-lg *:m-auto hover:bg-foreground/5">`);
		Logo($$renderer, { class: 'w-fit' });
		$$renderer.push(`<!----></a> <nav class="my-8 flex flex-wrap gap-x-8 gap-y-2"><!--[-->`);

		const each_array = $.ensure_array_like(links);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> `);
		ThemeSwitcher($$renderer, {});
		$$renderer.push(`<!----> <p class="mt-2 border-t pt-6 text-sm text-muted-foreground">© ${$.escape(year)} Veil.</p></div></div></footer>`);
	});
}