import * as $ from 'svelte/internal/server';
import { Heart, MapPin, Menu, UserRound } from '@lucide/svelte';
import MsSearch from '$lib/components/nav/ms-search.svelte';
import CartSidebar from '$lib/components/nav/cart-sidebar.svelte';
import ProfileDropdown from '$lib/components/nav/profile-dropdown.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';

export default function LimeNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			navModule,
			wishlistPlugin,
			wishlistState,
			userState,
			storeData,
			themeContent,
			pathname = ''
		} = $$props;

		// Header chrome is store-editable theme content; the literals below are only the
		// fallback for a store whose theme content has not been resolved yet.
		const navLinks = $.derived(() => themeContent?.nav?.links ?? []);

		const storeCtaLabel = $.derived(() => themeContent?.nav?.ctaLabel ?? 'Find a Store');
		const storeCtaHref = $.derived(() => themeContent?.nav?.ctaHref ?? '/store-locator');
		const brandName = $.derived(() => storeData?.name || themeContent?.brandName || 'Store');

		$$renderer.push(`<section class="lime-topbar svelte-3tnr1h"><a class="lime-find-store svelte-3tnr1h"${$.attr('href', storeCtaHref())}>`);
		MapPin($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> <span>${$.escape(storeCtaLabel())}</span></a></section> <header class="lime-header shadow-xs svelte-3tnr1h"><button class="lime-mobile-trigger svelte-3tnr1h" aria-label="Toggle menu">`);
		Menu($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----></button> <a class="lime-logo svelte-3tnr1h" href="/">`);

		if (storeData?.logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', storeData.logo)}${$.attr('alt', brandName())} class="svelte-3tnr1h"/>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="lime-wordmark svelte-3tnr1h">${$.escape(brandName())}</span>`);
		}

		$$renderer.push(`<!--]--></a> <nav class="lime-nav svelte-3tnr1h" aria-label="Main navigation"><!--[-->`);

		const each_array = $.ensure_array_like(navLinks());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', item.href)} class="svelte-3tnr1h">${$.escape(item.label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav> <div class="lime-actions svelte-3tnr1h">`);
		MsSearch($$renderer, {});
		$$renderer.push(`<!----> `);

		if (wishlistPlugin?.active) {
			$$renderer.push(`<!--[0--><div class="relative flex items-center justify-center" role="navigation"><a href="/my/wishlist" class="flex items-center justify-center text-gray-700 hover:text-black svelte-3tnr1h" aria-label="Wishlist">`);
			Heart($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> `);

			if (wishlistState?.count > 0) {
				$$renderer.push(`<!--[0--><span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground">${$.escape(wishlistState.count)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></a></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="lime-account flex items-center svelte-3tnr1h">`);

		if (userState?.user?.role) {
			$$renderer.push('<!--[0-->');
			ProfileDropdown($$renderer, { onSignOut: navModule.handleSignOut });
		} else {
			$$renderer.push('<!--[-1-->');

			AuthButton($$renderer, {
				'aria-label': 'Login',
				type: 'login',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center justify-center text-gray-700 hover:text-black">`);
					UserRound($$renderer, { class: 'h-5 w-5' });
					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div> `);

		if (!pathname.startsWith('/checkout')) {
			$$renderer.push('<!--[0-->');

			CartSidebar($$renderer, {
				onClose: navModule.closeCartSidebar,
				onContinueShopping: navModule.handleContinueShoppingClick,
				onRemoveCartItem: navModule.removeCartItem
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></header>`);
	});
}