import * as $ from 'svelte/internal/server';
import DocsSidebar from "../DocsSidebar.svelte";
import DocsNavbar from "../DocsNavbar.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		let isMobileMenuOpen = false;

		function toggleMobileMenu() {
			isMobileMenuOpen = !isMobileMenuOpen;
		}

		function closeMobileMenu() {
			isMobileMenuOpen = false;
		}

		$.head('1p7vac9', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', data.config.favicon
				? clientResolver(resolve, data.config.favicon)
				: data.config.favicon)}/>`);
		});

		$$renderer.push(`<div class="bg-background text-foreground min-h-screen">`);

		DocsNavbar($$renderer, {
			config: data.config,
			currentSlug: data.currentSlug,
			onMenuToggle: toggleMobileMenu,
			isMobileMenuOpen
		});

		$$renderer.push(`<!----> <div class="mx-auto flex px-0 pt-24">`);

		if (isMobileMenuOpen) {
			$$renderer.push(`<!--[0--><div class="fixed inset-0 top-24 z-35 bg-black/50 lg:hidden" role="presentation"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <aside${$.attr_class('bg-background scrollbar-hidden fixed top-24 bottom-0 left-0 z-40 w-[240px] -translate-x-full overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0', void 0, { 'translate-x-0': isMobileMenuOpen })}>`);

		DocsSidebar($$renderer, {
			config: data.config,
			currentSlug: data.currentSlug,
			onNavigate: closeMobileMenu
		});

		$$renderer.push(`<!----></aside> <div class="min-w-0 flex-1 p-6 px-8 lg:ml-[240px] lg:p-8 lg:px-8">`);
		children($$renderer);
		$$renderer.push(`<!----></div></div></div>`);
	});
}