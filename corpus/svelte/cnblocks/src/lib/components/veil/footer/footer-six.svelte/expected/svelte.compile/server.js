import * as $ from 'svelte/internal/server';
import Logo from "$lib/components/web/Logo.svelte";
import SocialMediaOne from "./social-media-one.svelte";
import ThemeSwitcher from "./theme-switcher.svelte";

export default function Footer_six($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
			{ label: "Features", href: "#" },
			{ label: "Pricing", href: "#" },
			{ label: "Blog", href: "#" }
		];

		const year = new Date().getFullYear();

		$$renderer.push(`<footer class="@container bg-background py-12"><div class="mx-auto max-w-2xl px-6"><div class="flex flex-col"><a href="/" aria-label="go home" class="-ml-1.5 flex size-8 rounded-lg *:m-auto hover:bg-foreground/5">`);
		Logo($$renderer, { class: 'size-5' });
		$$renderer.push(`<!----></a> <nav class="my-8 flex flex-col gap-y-4"><!--[-->`);

		const each_array = $.ensure_array_like(links);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', link.href)} class="text-sm text-muted-foreground transition-colors hover:text-foreground">${$.escape(link.label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> <div class="flex justify-between">`);
		ThemeSwitcher($$renderer, {});
		$$renderer.push(`<!----> `);
		SocialMediaOne($$renderer, {});
		$$renderer.push(`<!----></div> <p class="mt-2 border-t border-dashed border-foreground/10 pt-6 text-sm text-muted-foreground">© ${$.escape(year)} Veil.</p></div></div></footer>`);
	});
}