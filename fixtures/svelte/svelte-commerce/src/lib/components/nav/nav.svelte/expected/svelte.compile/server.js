import * as $ from 'svelte/internal/server';

import {
	X,
	UserCircle,
	ChevronLeft,
	ChevronDown,
	Phone,
	Mail,
	Menu,
	Heart,
	Home,
	Tag,
	Layers,
	Package,
	MapPin,
	KeyRound,
	LogOut
} from '@lucide/svelte';

import MainNav from './main-nav.svelte';
import MegaMenu from './mega-menu.svelte';
import { page } from '$app/state';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';
import MsSearch from './ms-search.svelte';
import AuthModal from '$lib/components/auth/auth-modal.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';
import { fade, fly } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
import { NavModule } from '$lib/core/composables/index.js';
import { getWishlistState } from '@misiki/kitcommerce-core/stores';
import CartSidebar from './cart-sidebar.svelte';
import ProfileDropdown from './profile-dropdown.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { onDestroy, onMount } from 'svelte';
import NoorNav from '$lib/theme/noor/NoorNav.svelte';
import LimeNav from '$lib/theme/lime/LimeNav.svelte';
import { resolveThemeContent } from '$lib/theme/index.js';

export default function Nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Local shadow of the vendored AuthButton — the packaged one is a <div role="button"> with
		// no tabindex/key handler, so the auth modal was unreachable by keyboard. See the component.
		const wishlistState = getWishlistState();

		const wishlistPlugin = $.derived(() => page?.data?.store?.plugins?.isWishlist);
		const navModule = new NavModule();
		const userState = navModule.userState;
		const isHomepage = $.derived(() => page.route?.id === '/(www)');

		// Hysteresis: collapse and expand at different offsets. With a single threshold the
		// header oscillates near the top — collapsing shrinks the sticky header, the browser's
		// scroll anchoring drops scrollY back under the threshold, the header re-expands, and
		// the cycle repeats. The gap must exceed the height lost on collapse (hello bar +
		// row-height change ≈ 56px).
		let isScrolled = false;

		const sidebarHistoryKey = '__svelteCommerceMobileSidebar';
		let ownsSidebarHistoryEntry = false;

		function handleSidebarBrowserBack() {
			if (!navModule.openSidebar || !ownsSidebarHistoryEntry) return;

			ownsSidebarHistoryEntry = false;
			navModule.openSidebar = false;
		}

		onMount(() => {
			window.addEventListener('popstate', handleSidebarBrowserBack);

			return () => window.removeEventListener('popstate', handleSidebarBrowserBack);
		});

		onDestroy(() => {
			if (typeof window !== 'undefined' && ownsSidebarHistoryEntry && history.state?.[sidebarHistoryKey] === true) {
				history.back();
			}
		});

		const menuItemsUser = $.derived(() => {
			const items = [
				{ title: 'Profile', url: '/my/profile' },
				{ title: 'Orders', url: '/my/orders' },
				// { title: 'Buy Again', url: '/my/buy-again' },
				{ title: 'Addresses', url: '/my/addresses' },
				{ title: 'Change Password', url: '/auth/change-password' }
			];

			if (wishlistPlugin()?.active) items.push({ title: 'Wishlist', url: '/my/wishlist' });

			return items;
		});

		const activeThemeName = $.derived(() => page.data?.theme?.name ?? 'default');
		const storeData = $.derived(() => page?.data?.store ?? {});

		// Admin-editable announcement bar (theme content). Fills the hello-bar slot unless the
		// hello-bar plugin is active AND actually has content (an active-but-empty plugin should
		// not suppress it), so the two never stack.
		const themeContent = $.derived(() => resolveThemeContent(activeThemeName(), page.data?.store));

		const themeHeader = $.derived(() => themeContent()?.header);
		const themeAnnouncement = $.derived(() => themeHeader()?.hideAnnouncement === true ? '' : themeHeader()?.announcement || '');
		const helloBarHasContent = $.derived(() => !!(navModule.helloBarPlugin?.active && (navModule.helloBarPlugin?.content || navModule.helloBarPlugin?.content2 || navModule.helloBarPlugin?.content3)));

		// Local expansion state for the nested mobile menu — tracks which header-menu parent is
		// open. Kept here (not the composable's category-sized showSubCategory) so it indexes by
		// the header menu itself.
		let mobileNestOpen = [];

		function toggleMobileNest(i) {
			mobileNestOpen[i] = !mobileNestOpen[i];
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (activeThemeName() === 'lime') {
				$$renderer.push('<!--[0-->');

				LimeNav($$renderer, {
					navModule,
					wishlistPlugin: wishlistPlugin(),
					wishlistState,
					userState,
					storeData: storeData(),
					themeContent: themeContent(),
					pathname: page.url.pathname
				});
			} else if (activeThemeName() === 'noor') {
				$$renderer.push('<!--[1-->');

				NoorNav($$renderer, {
					navModule,
					wishlistPlugin: wishlistPlugin(),
					wishlistState,
					userState,
					storeData: storeData(),
					themeContent: themeContent(),
					pathname: page.url.pathname
				});
			} else {
				$$renderer.push(`<!--[-1--><header${$.attr_class(`${navModule.isProductListingPage ? 'max-sm:border-b' : ''} shadow-xs sticky top-0 z-50 w-full flex-col items-center justify-between bg-background transition-all duration-200`, 'svelte-d9v6bn', { 'ed': activeThemeName() === 'default' })}>`);

				if (!helloBarHasContent() && themeAnnouncement() && isHomepage()) {
					$$renderer.push(`<!--[0--><div${$.attr_class(`grid transition-[grid-template-rows] duration-300 ease-in-out ${isScrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`, 'svelte-d9v6bn')}><div class="overflow-hidden svelte-d9v6bn"><div class="max-w-none bg-primary px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground svelte-d9v6bn">`);

					if (themeHeader()?.announcementHref) {
						$$renderer.push(`<!--[0--><a${$.attr('href', themeHeader().announcementHref)} class="transition-opacity hover:opacity-80 svelte-d9v6bn">${$.escape(themeAnnouncement())}</a>`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(themeAnnouncement())}`);
					}

					$$renderer.push(`<!--]--></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (helloBarHasContent() && isHomepage()) {
					$$renderer.push(`<!--[0--><div${$.attr_class(`grid transition-[grid-template-rows] duration-300 ease-in-out ${isScrolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`, 'svelte-d9v6bn')}><div class="overflow-hidden svelte-d9v6bn">`);

					if (navModule.helloBarPlugin?.content) {
						$$renderer.push(`<!--[0--><div class="max-w-none bg-primary py-2 text-center text-xs text-primary-foreground sm:text-sm svelte-d9v6bn"><ul class="sliding-list svelte-d9v6bn"${$.attr_style(`--item-count: ${$.stringify(navModule.itemCount)}; --anim-duration: ${$.stringify(navModule.animationDuration)}s;`)}>`);

						if (navModule.helloBarPlugin?.content) {
							$$renderer.push(`<!--[0--><li style="--index: 1;" class="svelte-d9v6bn">${$.html(navModule.helloBarPlugin?.content)}</li>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (navModule.helloBarPlugin?.content2) {
							$$renderer.push(`<!--[0--><li style="--index: 2;" class="svelte-d9v6bn">${$.html(navModule.helloBarPlugin?.content2)}</li>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (navModule.helloBarPlugin?.content3) {
							$$renderer.push(`<!--[0--><li style="--index: 3;" class="svelte-d9v6bn">${$.html(navModule.helloBarPlugin?.content3)}</li>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></ul></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="bg-primary py-2 text-center text-xs text-foreground sm:text-sm svelte-d9v6bn">${$.html(navModule.helloBarPlugin?.content)}</div>`);
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div${$.attr_class(`ed-row page-width flex items-center justify-between bg-background transition-[height] duration-300 ease-in-out ${isScrolled ? 'h-12' : 'h-16 sm:h-14'}`, 'svelte-d9v6bn')}><div class="hidden justify-center gap-3 sm:flex svelte-d9v6bn">`);

				Button($$renderer, {
					variant: 'ghost',
					size: 'icon',
					'aria-label': 'Sidebar',
					class: 'md:hidden',
					onclick: () => {
						navModule.openSidebar = true;
					},

					children: ($$renderer) => {
						Menu($$renderer, { class: 'text-foreground' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				MainNav($$renderer, {});
				$$renderer.push(`<!----></div> <div class="flex items-center justify-center sm:hidden svelte-d9v6bn">`);

				if (navModule.isProductListingPage) {
					$$renderer.push(`<!--[0--><div class="flex items-center gap-2 svelte-d9v6bn">`);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						'aria-label': 'Go back',
						onclick: navModule.goBack,
						children: ($$renderer) => {
							ChevronLeft($$renderer, { class: 'h-6 w-6 font-bold' });
							$$renderer.push(`<!----> <span class="sr-only svelte-d9v6bn">Go back</span>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="flex flex-col items-start svelte-d9v6bn">`);

					if (page.params?.slug || page.url?.searchParams?.get?.('search')) {
						$$renderer.push(`<!--[0--><p class="ed-plp-title text-base font-semibold capitalize svelte-d9v6bn">${$.escape(page.params?.slug?.replace?.(/-/g, ' ').replace?.(/\b\w/g, (c) => c?.toUpperCase?.()) || page.url?.searchParams?.get?.('search'))}</p>`);
					} else {
						$$renderer.push(`<!--[-1--><p class="ed-plp-title text-base font-semibold svelte-d9v6bn">Products</p>`);
					}

					$$renderer.push(`<!--]--> <p class="ed-plp-count text-xs text-muted-foreground svelte-d9v6bn">${$.escape((navModule.productsCount ?? 0).toLocaleString('en-US'))} products</p></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						'aria-label': 'Sidebar',
						class: 'md:hidden',
						onclick: () => {
							navModule.openSidebar = true;
						},

						children: ($$renderer) => {
							Menu($$renderer, { class: 'text-foreground' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					MainNav($$renderer, {});
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (navModule.megaMenuPluginActive) {
					$$renderer.push(`<!--[0--><div class="hidden md:block svelte-d9v6bn">`);
					MegaMenu($$renderer, { slim: isScrolled });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex items-center gap-2 sm:gap-2 svelte-d9v6bn">`);
				MsSearch($$renderer, {});
				$$renderer.push(`<!----> `);

				if (wishlistPlugin()?.active) {
					$$renderer.push(`<!--[0--><div class="relative hidden sm:block svelte-d9v6bn" role="navigation"><a href="/my/wishlist" class="ed-action flex items-center justify-center rounded-full px-2 text-muted-foreground transition-colors hover:text-foreground svelte-d9v6bn" aria-label="Wishlist">`);
					Heart($$renderer, { class: 'h-5 w-5' });
					$$renderer.push(`<!----> `);

					if (wishlistState?.count > 0) {
						$$renderer.push(`<!--[0--><span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground svelte-d9v6bn">${$.escape(wishlistState.count)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></a></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!page.url.pathname.startsWith('/checkout')) {
					$$renderer.push(`<!--[0--><div class="svelte-d9v6bn">`);

					CartSidebar($$renderer, {
						onClose: navModule.closeCartSidebar,
						onContinueShopping: navModule.handleContinueShoppingClick,
						onRemoveCartItem: navModule.removeCartItem
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="flex h-full items-center px-2 font-sans svelte-d9v6bn">`);

				if (userState?.user?.role) {
					$$renderer.push('<!--[0-->');
					ProfileDropdown($$renderer, { onSignOut: navModule.handleSignOut });
				} else {
					$$renderer.push('<!--[-1-->');

					AuthButton($$renderer, {
						'aria-label': 'Login',
						type: 'login',
						children: ($$renderer) => {
							$$renderer.push(`<div class="ed-action flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground svelte-d9v6bn">`);
							UserCircle($$renderer, { class: 'h-5 w-5' });
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div></div></div></header>`);
			}

			$$renderer.push(`<!--]--> `);

			if (navModule.openSidebar) {
				$$renderer.push(`<!--[0--><aside${$.attr_class('fixed inset-0 z-[100] flex overflow-hidden bg-transparent font-sans svelte-d9v6bn', void 0, { 'ed': activeThemeName() === 'default' })}><div role="button" tabindex="0" aria-label="Close sidebar" class="backdrop-blur-xs absolute inset-0 bg-black/40 svelte-d9v6bn"><span class="sr-only svelte-d9v6bn">Close sidebar</span></div> <div class="ed-drawer relative z-[60] flex h-full w-full max-w-[300px] flex-col overflow-hidden border-r border-border bg-background text-foreground shadow-2xl svelte-d9v6bn"><div class="ed-drawer-head flex items-center justify-between border-b border-border px-5 py-4 svelte-d9v6bn"><a href="/" class="flex items-center gap-2 svelte-d9v6bn">`);

				if (page?.data?.store?.logo) {
					$$renderer.push(`<!--[0--><img${$.attr('src', getImageCDNUrl(page?.data?.store?.logo, 240, 0))} class="h-8 object-contain svelte-d9v6bn"${$.attr('alt', page?.data?.store?.name || 'Logo')}/>`);
				} else {
					$$renderer.push(`<!--[-1--><span class="text-base font-black uppercase tracking-wider text-foreground svelte-d9v6bn">${$.escape(page?.data?.store?.name || 'Svelte Commerce')}</span>`);
				}

				$$renderer.push(`<!--]--></a> `);

				Button($$renderer, {
					variant: 'ghost',
					size: 'icon',
					'aria-label': 'Close sidebar',
					class: 'h-8 w-8 rounded-full bg-muted text-foreground hover:bg-muted/70',
					onclick: () => navModule.openSidebar = false,
					children: ($$renderer) => {
						X($$renderer, { class: 'h-4 w-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="ed-drawer-user border-b border-border bg-muted/50 px-5 py-4 svelte-d9v6bn">`);

				if (userState?.user?.role) {
					$$renderer.push(`<!--[0--><div class="flex items-center gap-3 svelte-d9v6bn"><div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary svelte-d9v6bn">`);

					if (userState.user?.avatar) {
						$$renderer.push(`<!--[0--><img${$.attr('src', userState.user.avatar)} alt="" class="h-full w-full object-cover svelte-d9v6bn"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
						UserCircle($$renderer, { class: 'h-5 w-5' });
					}

					$$renderer.push(`<!--]--></div> <div class="overflow-hidden svelte-d9v6bn"><p class="truncate text-xs font-bold text-foreground svelte-d9v6bn">${$.escape(userState.user?.firstName || userState.user?.name || 'My Account')}</p> <p class="truncate text-[10px] font-medium text-muted-foreground svelte-d9v6bn">${$.escape(userState.user?.email || '')}</p></div></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex flex-col gap-1.5 svelte-d9v6bn"><span class="ed-drawer-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Welcome Guest</span> `);

					AuthButton($$renderer, {
						'aria-label': 'Login',
						type: 'login',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/95 svelte-d9v6bn">`);
							UserCircle($$renderer, { class: 'h-4 w-4' });
							$$renderer.push(`<!----> <span class="svelte-d9v6bn">Login / Register</span></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="flex-1 space-y-6 overflow-y-auto px-5 py-4 svelte-d9v6bn"><div class="svelte-d9v6bn"><span class="ed-drawer-label mb-3 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Shop &amp; Explore</span> <ul class="m-0 flex w-full list-none flex-col gap-1.5 p-0 text-sm svelte-d9v6bn"><li class="svelte-d9v6bn"><a href="/" class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn">`);
				Home($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
				$$renderer.push(`<!----> <span class="svelte-d9v6bn">Home</span></a></li> <li class="svelte-d9v6bn"><a href="/products" class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn">`);
				Tag($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
				$$renderer.push(`<!----> <span class="svelte-d9v6bn">All Products</span></a></li></ul></div> `);

				if (navModule.navMenu?.length) {
					$$renderer.push(`<!--[0--><div class="svelte-d9v6bn"><span class="ed-drawer-label mb-3 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Quick Links</span> <ul class="m-0 flex w-full list-none flex-col gap-1.5 p-0 text-sm svelte-d9v6bn"><!--[-->`);

					const each_array = $.ensure_array_like(navModule.navMenu);

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let menuItem = each_array[i];

						$$renderer.push(`<li class="svelte-d9v6bn">`);

						if (menuItem?.items?.length) {
							$$renderer.push(`<!--[0--><div class="flex w-full items-center justify-between svelte-d9v6bn"><a${$.attr('href', menuItem?.link || (menuItem?.slug ? '/' + menuItem.slug : '/products'))} class="ed-drawer-link flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn">`);
							Layers($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
							$$renderer.push(`<!----> <span class="svelte-d9v6bn">${$.escape(menuItem.name)}</span></a> <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted svelte-d9v6bn"${$.attr('aria-label', `Toggle ${$.stringify(menuItem.name)}`)}${$.attr('aria-expanded', mobileNestOpen[i] ? 'true' : 'false')}>`);

							ChevronDown($$renderer, {
								class: `h-4 w-4 transition-transform duration-300 ${mobileNestOpen[i] ? '-rotate-180' : ''}`
							});

							$$renderer.push(`<!----></button></div> `);

							if (mobileNestOpen[i]) {
								$$renderer.push(`<!--[0--><ul class="m-0 ml-6 mt-1 flex list-none flex-col gap-1 border-l border-border p-0 pl-3 svelte-d9v6bn"><!--[-->`);

								const each_array_1 = $.ensure_array_like(menuItem.items);

								for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
									let child = each_array_1[$$index];

									$$renderer.push(`<li class="svelte-d9v6bn"><a${$.attr('href', child?.link || (child?.slug ? '/' + child.slug : '/products'))} class="ed-drawer-link block rounded-md px-3 py-1.5 text-[11px] font-medium text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn">${$.escape(child.name)}</a></li>`);
								}

								$$renderer.push(`<!--]--></ul>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push(`<!--[-1--><a${$.attr('href', menuItem?.link)} class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn">`);
							Layers($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
							$$renderer.push(`<!----> <span class="svelte-d9v6bn">${$.escape(menuItem.name)}</span></a>`);
						}

						$$renderer.push(`<!--]--></li>`);
					}

					$$renderer.push(`<!--]--></ul></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="svelte-d9v6bn"><span class="ed-drawer-label mb-3 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">My Account</span> <ul class="m-0 flex w-full list-none flex-col gap-1.5 p-0 text-sm svelte-d9v6bn">`);

				if (menuItemsUser()?.length) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array_2 = $.ensure_array_like(menuItemsUser());

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let m = each_array_2[$$index_2];

						$$renderer.push(`<li class="svelte-d9v6bn"><a${$.attr('href', m.url)} class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn">`);

						if (m.title === 'Profile') {
							$$renderer.push('<!--[0-->');
							UserCircle($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
						} else if (m.title === 'Orders') {
							$$renderer.push('<!--[1-->');
							Package($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
						} else if (m.title === 'Addresses') {
							$$renderer.push('<!--[2-->');
							MapPin($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
						} else if (m.title === 'Change Password') {
							$$renderer.push('<!--[3-->');
							KeyRound($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
						} else if (m.title === 'Wishlist') {
							$$renderer.push('<!--[4-->');
							Heart($$renderer, { class: 'h-4 w-4 text-muted-foreground' });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <span class="svelte-d9v6bn">${$.escape(m.title)}</span></a></li>`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (userState?.user?.role) {
					$$renderer.push(`<!--[0--><li class="svelte-d9v6bn"><button class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-destructive transition-all duration-200 hover:bg-destructive/10 hover:text-destructive svelte-d9v6bn">`);
					LogOut($$renderer, { class: 'h-4 w-4 text-destructive/70' });
					$$renderer.push(`<!----> <span class="svelte-d9v6bn">Sign Out</span></button></li>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></ul></div></div> `);

				if (page?.data?.store?.businessEmail || page?.data?.store?.businessPhone) {
					$$renderer.push(`<!--[0--><div class="ed-drawer-foot border-t border-border bg-muted/50 p-5 svelte-d9v6bn"><span class="ed-drawer-label mb-2 block text-[9px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Support Contact</span> <div class="flex flex-col gap-2 svelte-d9v6bn">`);

					if (page?.data?.store?.businessEmail) {
						$$renderer.push(`<!--[0--><a${$.attr('href', `mailto:${$.stringify(page?.data?.store?.businessEmail)}`)} aria-label="Email us" class="ed-contact flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground svelte-d9v6bn">`);
						Mail($$renderer, { class: 'h-3.5 w-3.5 text-muted-foreground' });
						$$renderer.push(`<!----> <span class="truncate svelte-d9v6bn">${$.escape(page?.data?.store?.businessEmail)}</span></a>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (page?.data?.store?.businessPhone) {
						$$renderer.push(`<!--[0--><a${$.attr('href', `tel:+${$.stringify(page?.data?.store?.businessPhone)}`)} aria-label="Call us" class="ed-contact flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground svelte-d9v6bn">`);
						Phone($$renderer, { class: 'h-3.5 w-3.5 text-muted-foreground' });
						$$renderer.push(`<!----> <span class="svelte-d9v6bn">+${$.escape(page?.data?.store?.businessPhone)}</span></a>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></aside>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			AuthModal($$renderer, {
				get show() {
					return navModule.showAuthModal;
				},

				set show($$value) {
					navModule.showAuthModal = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}