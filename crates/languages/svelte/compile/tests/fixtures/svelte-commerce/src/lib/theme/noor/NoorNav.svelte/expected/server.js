import * as $ from 'svelte/internal/server';
import { Heart, Menu, UserRound } from '@lucide/svelte';
import MsSearch from '$lib/components/nav/ms-search.svelte';
import CartSidebar from '$lib/components/nav/cart-sidebar.svelte';
import ProfileDropdown from '$lib/components/nav/profile-dropdown.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';

export default function NoorNav($$renderer, $$props) {
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

		// Header chrome is store-editable theme content.
		const navLinks = $.derived(() => themeContent?.nav?.links ?? []);

		const announcement = $.derived(() => themeContent?.nav?.announcement ?? '');
		const brandName = $.derived(() => storeData?.name || themeContent?.brandName || 'Store');

		if (announcement()) {
			$$renderer.push(`<!--[0--><section class="noor-announcement svelte-loucq3">${$.escape(announcement())}</section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <header class="noor-header shadow-xs svelte-loucq3"><div class="noor-header-main svelte-loucq3"><button class="noor-mobile-trigger svelte-loucq3" aria-label="Toggle menu">`);
		Menu($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----></button> <a href="/" class="noor-logo svelte-loucq3"${$.attr('aria-label', `${$.stringify(brandName())} home`)}>`);

		if (storeData?.logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', storeData.logo)}${$.attr('alt', brandName())} class="svelte-loucq3"/>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="noor-wordmark svelte-loucq3">${$.escape(brandName())}</span>`);
		}

		$$renderer.push(`<!--]--></a> <div class="noor-actions svelte-loucq3">`);
		MsSearch($$renderer, {});
		$$renderer.push(`<!----> `);

		if (wishlistPlugin?.active) {
			$$renderer.push(`<!--[0--><div class="relative hidden items-center justify-center sm:flex" role="navigation"><a href="/my/wishlist" class="flex items-center justify-center text-[#151515] hover:text-black" aria-label="Wishlist">`);
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

		$$renderer.push(`<!--]--> <div class="noor-account flex items-center svelte-loucq3">`);

		if (userState?.user?.role) {
			$$renderer.push('<!--[0-->');
			ProfileDropdown($$renderer, { onSignOut: navModule.handleSignOut });
		} else {
			$$renderer.push('<!--[-1-->');

			AuthButton($$renderer, {
				'aria-label': 'Login',
				type: 'login',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center justify-center text-[#151515] hover:text-black">`);
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

		$$renderer.push(`<!--]--></div></div> <nav class="noor-nav svelte-loucq3"${$.attr('aria-label', `${$.stringify(brandName())} categories`)}><!--[-->`);

		const each_array = $.ensure_array_like(navLinks());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', item.href)} class="svelte-loucq3">${$.escape(item.label)}</a>`);
		}

		$$renderer.push(`<!--]--></nav></header>`);
	});
}