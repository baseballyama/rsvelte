import * as $ from 'svelte/internal/server';
import { setCartState, setUserState, setWishlistState } from '$lib/core/stores/index.js';
import { page } from '$app/state';
import Footer from '$lib/components/common/footer.svelte';
import Nav from '$lib/components/nav/nav.svelte';
import { Home, Package, Users, Menu, MapPinHouse, X, Heart } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import Breadcrumb from '$lib/components/ui/breadcrumb-route.svelte';
import { StorePlugins } from '$lib/core/components/index.js';
import { fade, fly } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let isMobileMenuOpen = false;

		// The sidebar is a slide-in drawer below `md` and always-visible above it. `inert` is an HTML
		// attribute and cannot be media-queried, so the breakpoint has to be readable here. Matches the
		// Tailwind `md` breakpoint used on the <aside> below. Defaults to true so the nav is never
		// inert during SSR or before the listener attaches.
		let isDesktop = true;

		const wishlistPlugin = $.derived(() => page.data?.store?.plugins?.isWishlist);

		setWishlistState();
		setCartState();
		setUserState();

		const menuItems = $.derived(() => {
			const items = [
				{ href: '/my', icon: Home, label: 'Dashboard' },
				{ href: '/my/profile', icon: Users, label: 'Profile' },
				{ href: '/my/orders', icon: Package, label: 'Orders' },
				{ href: '/my/addresses', icon: MapPinHouse, label: 'Addresses' }

				// { href: '/my/profile', icon: Settings, label: 'Profile' }
			];

			if (wishlistPlugin()?.active) items.push({ href: '/my/wishlist', icon: Heart, label: 'Wishlist' });

			return items;
		});

		let breadcrumbItems = [];

		$.head('brkybl', $$renderer, ($$renderer) => {
			$$renderer.push(`<meta name="robots" content="noindex, nofollow"/>`);
		});

		StorePlugins($$renderer, {});
		$$renderer.push(`<!----> `);
		Nav($$renderer, {});
		$$renderer.push(`<!----> <div class="page-width relative flex min-h-screen flex-col overflow-hidden p-0 md:flex-row md:p-0">`);

		if (isMobileMenuOpen) {
			$$renderer.push(`<!--[0--><div class="fixed inset-0 z-20 md:hidden">`);

			Button($$renderer, {
				variant: 'ghost',
				class: 'h-full w-full rounded-none bg-black/30 p-0 hover:bg-black/30',
				onclick: () => isMobileMenuOpen = false,
				children: ($$renderer) => {
					$$renderer.push(`<span class="sr-only">Close menu</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <aside${$.attr_class(
			`fixed left-0 top-0 z-30 h-full w-[80%] max-w-xs transform bg-white transition-all duration-300 ease-in-out md:sticky md:w-72 md:translate-x-0 ${isMobileMenuOpen
				? 'translate-x-0 shadow-2xl'
				: '-translate-x-full md:shadow-none'}`,
			'svelte-brkybl',
			{ 'md:relative': true }
		)}><nav${$.attr('inert', !isMobileMenuOpen && !isDesktop, true)} class="relative top-[5rem] space-y-2 p-6 pt-10 md:top-0 md:pt-12"><!--[-->`);

		const each_array = $.ensure_array_like(menuItems());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let { href, icon: Icon, label } = each_array[i];
			const isActive = page.url.pathname === href || page.url.pathname.startsWith(href) && href !== '/my';

			Button($$renderer, {
				href,
				variant: isActive ? 'default' : 'ghost',
				class: 'w-full justify-start',
				onclick: () => isMobileMenuOpen = false,
				children: ($$renderer) => {
					if (Icon) {
						$$renderer.push('<!--[-->');
						Icon($$renderer, { class: 'mr-4 h-5 w-5' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` ${$.escape(label)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></nav></aside> <main id="main" class="flex-1 overflow-y-auto px-2 md:px-6 svelte-brkybl"><div class="mb-4 block flex justify-start items-center max-md:flex max-md:gap-2">`);

		Button($$renderer, {
			variant: 'ghost',
			size: 'icon',
			class: 'md:hidden',
			onclick: () => isMobileMenuOpen = !isMobileMenuOpen,
			children: ($$renderer) => {
				if (isMobileMenuOpen) {
					$$renderer.push('<!--[0-->');
					X($$renderer, { class: 'h-4 w-4' });
				} else {
					$$renderer.push('<!--[-1-->');
					Menu($$renderer, { class: 'h-4 w-4' });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="md:hidden">`);
		Breadcrumb($$renderer, { items: breadcrumbItems });
		$$renderer.push(`<!----></div></div> `);
		children($$renderer);
		$$renderer.push(`<!----></main></div> `);
		Footer($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}