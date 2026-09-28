import * as $ from 'svelte/internal/server';
import { Button } from "bits-ui";
import Search from "./search.svelte";
import { Logo } from "$icons/index.js";
import LightSwitch from "$lib/components/light-switch.svelte";
import MobileNav from "$lib/components/navigation/mobile-nav.svelte";
import { siteConfig } from "$lib/config/index.js";
import Github from "$icons/github.svelte";

export default function Site_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<header class="border-border bg-background/75 sticky top-0 z-50 overflow-x-hidden border-b backdrop-blur-md"><div class="px-4"><div class="flex h-[70px] items-center justify-between gap-3"><div class="flex w-full items-center gap-1.5 md:w-auto">`);
		MobileNav($$renderer, {});
		$$renderer.push(`<!----> <a href="/" class="focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden ml-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 md:mr-[125px]">`);
		Logo($$renderer, {});
		$$renderer.push(`<!----></a> `);
		Search($$renderer, {});
		$$renderer.push(`<!----></div> <div class="flex items-center justify-end">`);

		if (Button.Root) {
			$$renderer.push('<!--[-->');

			Button.Root($$renderer, {
				href: siteConfig.links?.github,
				target: '_blank',
				rel: 'noopener noreferrer',
				'aria-label': 'Light Switch',
				class: 'rounded-input hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex h-10 w-10 items-center justify-center px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
				children: ($$renderer) => {
					Github($$renderer, { class: 'size-5' });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		LightSwitch($$renderer, {});
		$$renderer.push(`<!----></div></div></div></header>`);
	});
}