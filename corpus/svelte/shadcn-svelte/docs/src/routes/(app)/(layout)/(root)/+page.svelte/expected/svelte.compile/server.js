import * as $ from 'svelte/internal/server';
import { IconArrowRight } from "@tabler/icons-svelte";
import Announcement from "$lib/components/announcement.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import Button from "$lib/registry/ui/button/button.svelte";
import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";
import CardsDemo from "./cards/cards-demo.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const title = "The Foundation for your Design System";
		const description = "A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.";
		const mobile = new IsMobile();

		Metadata($$renderer, { title, description });
		$$renderer.push(`<!----> <div class="flex flex-1 flex-col">`);

		PageHeader($$renderer, {
			class: 'md:**:[.container]:pb-8 lg:**:[.container]:pb-12',
			children: ($$renderer) => {
				Announcement($$renderer, {});
				$$renderer.push(`<!----> `);

				PageHeaderHeading($$renderer, {
					class: 'max-w-4xl',
					children: ($$renderer) => {
						$$renderer.push(`<!---->The Foundation for your Design System`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				PageHeaderDescription($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				PageActions($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							href: '/create?preset=b27GcrRo',
							class: 'h-[31px] rounded-lg',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Build Your Own `);
								IconArrowRight($$renderer, { 'data-icon': 'inline-end' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="container-wrapper flex-1 p-0"><div class="container overflow-hidden md:px-0 lg:max-w-none"><section class="-mx-4 w-[140vw] overflow-hidden md:hidden"><enhanced:img src="../../../../../static/img/registry/full-light.png" width="2560" height="2764" alt="Dashboard" class="block h-auto w-full dark:hidden" fetchpriority="high"${$.attr('loading', mobile.current ? "eager" : "lazy")}></enhanced:img> <enhanced:img src="../../../../../static/img/registry/full-dark.png" width="2560" height="2764" alt="Dashboard" class="hidden h-auto w-full dark:block" fetchpriority="high"${$.attr('loading', mobile.current ? "eager" : "lazy")}></enhanced:img></section> `);

		if (!mobile.current) {
			$$renderer.push(`<!--[0--><section class="hidden md:block"><div class="style-rhea base-color-neutral theme-neutral" style="--radius: 0.625rem; font-family: 'Inter Variable', sans-serif;">`);
			CardsDemo($$renderer, {});
			$$renderer.push(`<!----></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}