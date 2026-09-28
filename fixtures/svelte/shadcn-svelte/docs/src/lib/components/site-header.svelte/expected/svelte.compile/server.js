import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import PlusIcon from "@lucide/svelte/icons/plus";
import SquareTerminal from "@lucide/svelte/icons/square-terminal";
import Separator from "$lib/registry/ui/separator/separator.svelte";
import { getColors } from "$lib/colors.js";
import { mainNavItems } from "$lib/navigation.js";
import { Button } from "$lib/registry/ui/button/index.js";
import CommandMenu from "./command-menu/command-menu.svelte";
import Customizer from "./customizer.svelte";
import GithubLink from "./github-link.svelte";
import LayoutToggle from "./layout-toggle.svelte";
import MainNav from "./main-nav.svelte";
import MobileNav from "./mobile-nav.svelte";
import ModeSwitcher from "./mode-switcher.svelte";
import { InitializeProjectCtx } from "../../routes/(app)/(layout)/(create)/components/initialize-project-context.svelte.js";

export default function Site_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const initializeProjectCtx = InitializeProjectCtx.getOr(null);
		const colors = getColors();
		let mobileNavRef;

		function closeMobileMenu() {
			if (mobileNavRef) {
				mobileNavRef.closeMenu();
			}
		}

		$$renderer.push(`<header class="sticky top-0 z-50 w-full bg-background"><div class="container-wrapper px-6 group-has-data-[slot=designer]/layout:max-w-none 3xl:fixed:px-0"><div class="flex h-(--header-height) items-center **:data-[slot=separator]:h-4! group-has-data-[slot=designer]/layout:fixed:max-w-none 3xl:fixed:container">`);
		MobileNav($$renderer, { class: 'flex lg:hidden' });
		$$renderer.push(`<!----> `);
		MainNav($$renderer, { items: mainNavItems, class: 'hidden lg:flex' });
		$$renderer.push(`<!----> <div class="ml-auto flex items-center gap-2 md:flex-1 md:justify-end"><div class="hidden w-full flex-1 md:flex md:w-auto md:flex-none">`);
		CommandMenu($$renderer, { colors, closeMobileMenu });
		$$renderer.push(`<!----></div> `);
		Separator($$renderer, { orientation: 'vertical', class: 'ml-2 hidden lg:block' });
		$$renderer.push(`<!----> `);
		GithubLink($$renderer, {});
		$$renderer.push(`<!----> `);
		Separator($$renderer, { orientation: 'vertical', class: 'hidden 3xl:flex' });
		$$renderer.push(`<!----> `);
		LayoutToggle($$renderer, { class: 'hidden 3xl:flex' });
		$$renderer.push(`<!----> `);
		Separator($$renderer, { orientation: 'vertical' });
		$$renderer.push(`<!----> `);

		if (page.url.pathname.startsWith("/create")) {
			$$renderer.push('<!--[0-->');
			ModeSwitcher($$renderer, { class: 'md:hidden' });
			$$renderer.push(`<!----> `);
			Separator($$renderer, { orientation: 'vertical' });
			$$renderer.push(`<!----> `);

			if (initializeProjectCtx) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					onclick: () => initializeProjectCtx.open = true,
					variant: 'default',
					size: 'sm',
					class: 'hidden md:flex',
					children: ($$renderer) => {
						SquareTerminal($$renderer, {});
						$$renderer.push(`<!----> Initialize Project`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
			Customizer($$renderer, {});
			$$renderer.push(`<!----> `);

			Button($$renderer, {
				href: '/create',
				variant: 'default',
				size: 'sm',
				class: 'h-[31px] rounded-lg',
				children: ($$renderer) => {
					PlusIcon($$renderer, {});
					$$renderer.push(`<!----> New`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div></div></div></header>`);
	});
}