import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<a class="transition-opacity hover:opacity-80 svelte-d9v6bn"> </a>`);
var root_1 = $.from_html(`<div><div class="overflow-hidden svelte-d9v6bn"><div class="max-w-none bg-primary px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground svelte-d9v6bn"><!></div></div></div>`);
var root_2 = $.from_html(`<li style="--index: 1;" class="svelte-d9v6bn"></li>`);
var root_3 = $.from_html(`<li style="--index: 2;" class="svelte-d9v6bn"></li>`);
var root_4 = $.from_html(`<li style="--index: 3;" class="svelte-d9v6bn"></li>`);
var root_5 = $.from_html(`<div class="max-w-none bg-primary py-2 text-center text-xs text-primary-foreground sm:text-sm svelte-d9v6bn"><ul class="sliding-list svelte-d9v6bn"><!> <!> <!></ul></div>`);
var root_6 = $.from_html(`<div class="bg-primary py-2 text-center text-xs text-foreground sm:text-sm svelte-d9v6bn"></div>`);
var root_7 = $.from_html(`<div><div class="overflow-hidden svelte-d9v6bn"><!></div></div>`);
var root_8 = $.from_html(`<!> <span class="sr-only svelte-d9v6bn">Go back</span>`, 1);
var root_9 = $.from_html(`<p class="ed-plp-title text-base font-semibold capitalize svelte-d9v6bn"> </p>`);
var root_10 = $.from_html(`<p class="ed-plp-title text-base font-semibold svelte-d9v6bn">Products</p>`);
var root_11 = $.from_html(`<div class="flex items-center gap-2 svelte-d9v6bn"><!> <div class="flex flex-col items-start svelte-d9v6bn"><!> <p class="ed-plp-count text-xs text-muted-foreground svelte-d9v6bn"> </p></div></div>`);
var root_12 = $.from_html(`<!> <!>`, 1);
var root_13 = $.from_html(`<div class="hidden md:block svelte-d9v6bn"><!></div>`);
var root_14 = $.from_html(`<span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground svelte-d9v6bn"> </span>`);
var root_15 = $.from_html(`<div class="relative hidden sm:block svelte-d9v6bn" role="navigation"><a href="/my/wishlist" class="ed-action flex items-center justify-center rounded-full px-2 text-muted-foreground transition-colors hover:text-foreground svelte-d9v6bn" aria-label="Wishlist"><!> <!></a></div>`);
var root_16 = $.from_html(`<div class="svelte-d9v6bn"><!></div>`);
var root_17 = $.from_html(`<div class="ed-action flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground svelte-d9v6bn"><!></div>`);
var root_18 = $.from_html(`<header><!> <!> <div><div class="hidden justify-center gap-3 sm:flex svelte-d9v6bn"><!> <!></div> <div class="flex items-center justify-center sm:hidden svelte-d9v6bn"><!></div> <!> <div class="flex items-center gap-2 sm:gap-2 svelte-d9v6bn"><!> <!> <!> <div class="flex h-full items-center px-2 font-sans svelte-d9v6bn"><!></div></div></div></header>`);
var root_19 = $.from_html(`<img class="h-8 object-contain svelte-d9v6bn"/>`);
var root_20 = $.from_html(`<span class="text-base font-black uppercase tracking-wider text-foreground svelte-d9v6bn"> </span>`);
var root_21 = $.from_html(`<img alt="" class="h-full w-full object-cover svelte-d9v6bn"/>`);
var root_22 = $.from_html(`<div class="flex items-center gap-3 svelte-d9v6bn"><div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary svelte-d9v6bn"><!></div> <div class="overflow-hidden svelte-d9v6bn"><p class="truncate text-xs font-bold text-foreground svelte-d9v6bn"> </p> <p class="truncate text-[10px] font-medium text-muted-foreground svelte-d9v6bn"> </p></div></div>`);
var root_23 = $.from_html(`<div class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all duration-200 hover:bg-primary/95 svelte-d9v6bn"><!> <span class="svelte-d9v6bn">Login / Register</span></div>`);
var root_24 = $.from_html(`<div class="flex flex-col gap-1.5 svelte-d9v6bn"><span class="ed-drawer-label text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Welcome Guest</span> <!></div>`);
var root_25 = $.from_html(`<li class="svelte-d9v6bn"><a class="ed-drawer-link block rounded-md px-3 py-1.5 text-[11px] font-medium text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn"> </a></li>`);
var root_26 = $.from_html(`<ul class="m-0 ml-6 mt-1 flex list-none flex-col gap-1 border-l border-border p-0 pl-3 svelte-d9v6bn"></ul>`);
var root_27 = $.from_html(`<div class="flex w-full items-center justify-between svelte-d9v6bn"><a class="ed-drawer-link flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn"><!> <span class="svelte-d9v6bn"> </span></a> <button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted svelte-d9v6bn"><!></button></div> <!>`, 1);
var root_28 = $.from_html(`<a class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn"><!> <span class="svelte-d9v6bn"> </span></a>`);
var root_29 = $.from_html(`<li class="svelte-d9v6bn"><!></li>`);
var root_30 = $.from_html(`<div class="svelte-d9v6bn"><span class="ed-drawer-label mb-3 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Quick Links</span> <ul class="m-0 flex w-full list-none flex-col gap-1.5 p-0 text-sm svelte-d9v6bn"></ul></div>`);
var root_31 = $.from_html(`<li class="svelte-d9v6bn"><a class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn"><!> <span class="svelte-d9v6bn"> </span></a></li>`);
var root_32 = $.from_html(`<li class="svelte-d9v6bn"><button class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-destructive transition-all duration-200 hover:bg-destructive/10 hover:text-destructive svelte-d9v6bn"><!> <span class="svelte-d9v6bn">Sign Out</span></button></li>`);
var root_33 = $.from_html(`<a aria-label="Email us" class="ed-contact flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground svelte-d9v6bn"><!> <span class="truncate svelte-d9v6bn"> </span></a>`);
var root_34 = $.from_html(`<a aria-label="Call us" class="ed-contact flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground svelte-d9v6bn"><!> <span class="svelte-d9v6bn"> </span></a>`);
var root_35 = $.from_html(`<div class="ed-drawer-foot border-t border-border bg-muted/50 p-5 svelte-d9v6bn"><span class="ed-drawer-label mb-2 block text-[9px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Support Contact</span> <div class="flex flex-col gap-2 svelte-d9v6bn"><!> <!></div></div>`);
var root_36 = $.from_html(`<aside><div role="button" tabindex="0" aria-label="Close sidebar" class="backdrop-blur-xs absolute inset-0 bg-black/40 svelte-d9v6bn"><span class="sr-only svelte-d9v6bn">Close sidebar</span></div> <div class="ed-drawer relative z-[60] flex h-full w-full max-w-[300px] flex-col overflow-hidden border-r border-border bg-background text-foreground shadow-2xl svelte-d9v6bn"><div class="ed-drawer-head flex items-center justify-between border-b border-border px-5 py-4 svelte-d9v6bn"><a href="/" class="flex items-center gap-2 svelte-d9v6bn"><!></a> <!></div> <div class="ed-drawer-user border-b border-border bg-muted/50 px-5 py-4 svelte-d9v6bn"><!></div> <div class="flex-1 space-y-6 overflow-y-auto px-5 py-4 svelte-d9v6bn"><div class="svelte-d9v6bn"><span class="ed-drawer-label mb-3 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">Shop & Explore</span> <ul class="m-0 flex w-full list-none flex-col gap-1.5 p-0 text-sm svelte-d9v6bn"><li class="svelte-d9v6bn"><a href="/" class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn"><!> <span class="svelte-d9v6bn">Home</span></a></li> <li class="svelte-d9v6bn"><a href="/products" class="ed-drawer-link flex items-center gap-3 rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-muted hover:text-primary svelte-d9v6bn"><!> <span class="svelte-d9v6bn">All Products</span></a></li></ul></div> <!> <div class="svelte-d9v6bn"><span class="ed-drawer-label mb-3 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground svelte-d9v6bn">My Account</span> <ul class="m-0 flex w-full list-none flex-col gap-1.5 p-0 text-sm svelte-d9v6bn"><!> <!></ul></div></div> <!></div></aside>`);
var root_37 = $.from_html(`<!> <!> <!>`, 1);

export default function Nav($$anchor, $$props) {
	$.push($$props, true);

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
	let isScrolled = $.state(false);

	$.user_effect(() => {
		if (navModule.scrollY > 90) $.set(isScrolled, true); else if (navModule.scrollY < 10) $.set(isScrolled, false);
	});

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

	$.user_effect(() => {
		if (typeof window === 'undefined') return;

		if (navModule.openSidebar && !ownsSidebarHistoryEntry) {
			history.pushState({ ...history.state, [sidebarHistoryKey]: true }, '', window.location.href);
			ownsSidebarHistoryEntry = true;
		} else if (!navModule.openSidebar && ownsSidebarHistoryEntry) {
			const isCurrentSidebarEntry = history.state?.[sidebarHistoryKey] === true;

			ownsSidebarHistoryEntry = false;

			if (isCurrentSidebarEntry) history.back();
		}
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

		if ($.get(wishlistPlugin)?.active) items.push({ title: 'Wishlist', url: '/my/wishlist' });

		return items;
	});

	const activeThemeName = $.derived(() => page.data?.theme?.name ?? 'default');
	const storeData = $.derived(() => page?.data?.store ?? {});

	// Admin-editable announcement bar (theme content). Fills the hello-bar slot unless the
	// hello-bar plugin is active AND actually has content (an active-but-empty plugin should
	// not suppress it), so the two never stack.
	const themeContent = $.derived(() => resolveThemeContent($.get(activeThemeName), page.data?.store));

	const themeHeader = $.derived(() => $.get(themeContent)?.header);
	const themeAnnouncement = $.derived(() => $.get(themeHeader)?.hideAnnouncement === true ? '' : $.get(themeHeader)?.announcement || '');
	const helloBarHasContent = $.derived(() => !!(navModule.helloBarPlugin?.active && (navModule.helloBarPlugin?.content || navModule.helloBarPlugin?.content2 || navModule.helloBarPlugin?.content3)));

	// Local expansion state for the nested mobile menu — tracks which header-menu parent is
	// open. Kept here (not the composable's category-sized showSubCategory) so it indexes by
	// the header menu itself.
	let mobileNestOpen = $.proxy([]);

	function toggleMobileNest(i) {
		mobileNestOpen[i] = !mobileNestOpen[i];
	}

	var fragment = root_37();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			LimeNav($$anchor, {
				get navModule() {
					return navModule;
				},

				get wishlistPlugin() {
					return $.get(wishlistPlugin);
				},

				get wishlistState() {
					return wishlistState;
				},

				get userState() {
					return userState;
				},

				get storeData() {
					return $.get(storeData);
				},

				get themeContent() {
					return $.get(themeContent);
				},

				get pathname() {
					return page.url.pathname;
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			NoorNav($$anchor, {
				get navModule() {
					return navModule;
				},

				get wishlistPlugin() {
					return $.get(wishlistPlugin);
				},

				get wishlistState() {
					return wishlistState;
				},

				get userState() {
					return userState;
				},

				get storeData() {
					return $.get(storeData);
				},

				get themeContent() {
					return $.get(themeContent);
				},

				get pathname() {
					return page.url.pathname;
				}
			});
		};

		var alternate_5 = ($$anchor) => {
			var header = root_18();
			let classes;
			var node_1 = $.child(header);

			{
				var consequent_3 = ($$anchor) => {
					var div = root_1();
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var node_2 = $.child(div_2);

					{
						var consequent_2 = ($$anchor) => {
							var a = root();
							var text = $.only_child(a, true);

							$.template_effect(() => {
								$.set_attribute(a, 'href', $.get(themeHeader).announcementHref);
								$.set_text(text, $.get(themeAnnouncement));
							});

							$.append($$anchor, a);
						};

						var alternate = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(themeAnnouncement)));
							$.append($$anchor, text_1);
						};

						$.if(node_2, ($$render) => {
							if ($.get(themeHeader)?.announcementHref) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.reset(div_2);
					$.reset(div_1);
					$.reset(div);
					$.template_effect(() => $.set_class(div, 1, `grid transition-[grid-template-rows] duration-300 ease-in-out ${$.get(isScrolled) ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`, 'svelte-d9v6bn'));
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (!$.get(helloBarHasContent) && $.get(themeAnnouncement) && $.get(isHomepage)) $$render(consequent_3);
				});
			}

			var node_3 = $.sibling(node_1, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_3 = root_7();
					var div_4 = $.child(div_3);
					var node_4 = $.child(div_4);

					{
						var consequent_7 = ($$anchor) => {
							var div_5 = root_5();
							var ul = $.child(div_5);
							var node_5 = $.child(ul);

							{
								var consequent_4 = ($$anchor) => {
									var li = root_2();

									$.html(li, () => navModule.helloBarPlugin?.content, true);
									$.reset(li);
									$.append($$anchor, li);
								};

								$.if(node_5, ($$render) => {
									if (navModule.helloBarPlugin?.content) $$render(consequent_4);
								});
							}

							var node_6 = $.sibling(node_5, 2);

							{
								var consequent_5 = ($$anchor) => {
									var li_1 = root_3();

									$.html(li_1, () => navModule.helloBarPlugin?.content2, true);
									$.reset(li_1);
									$.append($$anchor, li_1);
								};

								$.if(node_6, ($$render) => {
									if (navModule.helloBarPlugin?.content2) $$render(consequent_5);
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								var consequent_6 = ($$anchor) => {
									var li_2 = root_4();

									$.html(li_2, () => navModule.helloBarPlugin?.content3, true);
									$.reset(li_2);
									$.append($$anchor, li_2);
								};

								$.if(node_7, ($$render) => {
									if (navModule.helloBarPlugin?.content3) $$render(consequent_6);
								});
							}

							$.reset(ul);
							$.reset(div_5);
							$.template_effect(() => $.set_style(ul, `--item-count: ${navModule.itemCount ?? ''}; --anim-duration: ${navModule.animationDuration ?? ''}s;`));
							$.append($$anchor, div_5);
						};

						var alternate_1 = ($$anchor) => {
							var div_6 = root_6();

							$.html(div_6, () => navModule.helloBarPlugin?.content, true);
							$.reset(div_6);
							$.append($$anchor, div_6);
						};

						$.if(node_4, ($$render) => {
							if (navModule.helloBarPlugin?.content) $$render(consequent_7); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_4);
					$.reset(div_3);
					$.template_effect(() => $.set_class(div_3, 1, `grid transition-[grid-template-rows] duration-300 ease-in-out ${$.get(isScrolled) ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`, 'svelte-d9v6bn'));
					$.append($$anchor, div_3);
				};

				$.if(node_3, ($$render) => {
					if ($.get(helloBarHasContent) && $.get(isHomepage)) $$render(consequent_8);
				});
			}

			var div_7 = $.sibling(node_3, 2);
			var div_8 = $.child(div_7);
			var node_8 = $.child(div_8);

			Button(node_8, {
				variant: 'ghost',
				size: 'icon',
				'aria-label': 'Sidebar',
				class: 'md:hidden',
				onclick: () => {
					navModule.openSidebar = true;
				},

				children: ($$anchor, $$slotProps) => {
					Menu($$anchor, { class: 'text-foreground' });
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			MainNav(node_9, {});
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_10 = $.child(div_9);

			{
				var consequent_10 = ($$anchor) => {
					var div_10 = root_11();
					var node_11 = $.child(div_10);

					Button(node_11, {
						variant: 'ghost',
						size: 'icon',
						'aria-label': 'Go back',
						get onclick() {
							return navModule.goBack;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_8();
							var node_12 = $.first_child(fragment_5);

							ChevronLeft(node_12, { class: 'h-6 w-6 font-bold' });
							$.next(2);
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var div_11 = $.sibling(node_11, 2);
					var node_13 = $.child(div_11);

					{
						var consequent_9 = ($$anchor) => {
							var p = root_9();
							var text_2 = $.only_child(p, true);

							$.template_effect(($0) => $.set_text(text_2, $0), [
								() => page.params?.slug?.replace?.(/-/g, ' ').replace?.(/\b\w/g, (c) => c?.toUpperCase?.()) || page.url?.searchParams?.get?.('search')
							]);

							$.append($$anchor, p);
						};

						var d = $.derived(() => page.params?.slug || page.url?.searchParams?.get?.('search'));

						var alternate_2 = ($$anchor) => {
							var p_1 = root_10();

							$.append($$anchor, p_1);
						};

						$.if(node_13, ($$render) => {
							if ($.get(d)) $$render(consequent_9); else $$render(alternate_2, -1);
						});
					}

					var p_2 = $.sibling(node_13, 2);
					var text_3 = $.only_child(p_2);

					$.reset(div_11);
					$.reset(div_10);
					$.template_effect(($0) => $.set_text(text_3, `${$0 ?? ''} products`), [() => (navModule.productsCount ?? 0).toLocaleString('en-US')]);
					$.append($$anchor, div_10);
				};

				var alternate_3 = ($$anchor) => {
					var fragment_6 = root_12();
					var node_14 = $.first_child(fragment_6);

					Button(node_14, {
						variant: 'ghost',
						size: 'icon',
						'aria-label': 'Sidebar',
						class: 'md:hidden',
						onclick: () => {
							navModule.openSidebar = true;
						},

						children: ($$anchor, $$slotProps) => {
							Menu($$anchor, { class: 'text-foreground' });
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					MainNav(node_15, {});
					$.append($$anchor, fragment_6);
				};

				$.if(node_10, ($$render) => {
					if (navModule.isProductListingPage) $$render(consequent_10); else $$render(alternate_3, -1);
				});
			}

			$.reset(div_9);

			var node_16 = $.sibling(div_9, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_12 = root_13();
					var node_17 = $.child(div_12);

					MegaMenu(node_17, {
						get slim() {
							return $.get(isScrolled);
						}
					});

					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				$.if(node_16, ($$render) => {
					if (navModule.megaMenuPluginActive) $$render(consequent_11);
				});
			}

			var div_13 = $.sibling(node_16, 2);
			var node_18 = $.child(div_13);

			MsSearch(node_18, {});

			var node_19 = $.sibling(node_18, 2);

			{
				var consequent_13 = ($$anchor) => {
					var div_14 = root_15();
					var a_1 = $.child(div_14);
					var node_20 = $.child(a_1);

					Heart(node_20, { class: 'h-5 w-5' });

					var node_21 = $.sibling(node_20, 2);

					{
						var consequent_12 = ($$anchor) => {
							var span = root_14();
							var text_4 = $.only_child(span, true);

							$.template_effect(() => $.set_text(text_4, wishlistState.count));
							$.append($$anchor, span);
						};

						$.if(node_21, ($$render) => {
							if (wishlistState?.count > 0) $$render(consequent_12);
						});
					}

					$.reset(a_1);
					$.reset(div_14);
					$.append($$anchor, div_14);
				};

				$.if(node_19, ($$render) => {
					if ($.get(wishlistPlugin)?.active) $$render(consequent_13);
				});
			}

			var node_22 = $.sibling(node_19, 2);

			{
				var consequent_14 = ($$anchor) => {
					var div_15 = root_16();
					var node_23 = $.child(div_15);

					CartSidebar(node_23, {
						get onClose() {
							return navModule.closeCartSidebar;
						},

						get onContinueShopping() {
							return navModule.handleContinueShoppingClick;
						},

						get onRemoveCartItem() {
							return navModule.removeCartItem;
						}
					});

					$.reset(div_15);
					$.append($$anchor, div_15);
				};

				var d_1 = $.derived(() => !page.url.pathname.startsWith('/checkout'));

				$.if(node_22, ($$render) => {
					if ($.get(d_1)) $$render(consequent_14);
				});
			}

			var div_16 = $.sibling(node_22, 2);
			var node_24 = $.child(div_16);

			{
				var consequent_15 = ($$anchor) => {
					ProfileDropdown($$anchor, {
						get onSignOut() {
							return navModule.handleSignOut;
						}
					});
				};

				var alternate_4 = ($$anchor) => {
					AuthButton($$anchor, {
						'aria-label': 'Login',
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							var div_17 = root_17();
							var node_25 = $.child(div_17);

							UserCircle(node_25, { class: 'h-5 w-5' });
							$.reset(div_17);
							$.append($$anchor, div_17);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_24, ($$render) => {
					if (userState?.user?.role) $$render(consequent_15); else $$render(alternate_4, -1);
				});
			}

			$.reset(div_16);
			$.reset(div_13);
			$.reset(div_7);
			$.reset(header);

			$.template_effect(() => {
				classes = $.set_class(header, 1, `${navModule.isProductListingPage ? 'max-sm:border-b' : ''} shadow-xs sticky top-0 z-50 w-full flex-col items-center justify-between bg-background transition-all duration-200`, 'svelte-d9v6bn', classes, { ed: $.get(activeThemeName) === 'default' });
				$.set_class(div_7, 1, `ed-row page-width flex items-center justify-between bg-background transition-[height] duration-300 ease-in-out ${$.get(isScrolled) ? 'h-12' : 'h-16 sm:h-14'}`, 'svelte-d9v6bn');
			});

			$.append($$anchor, header);
		};

		$.if(node, ($$render) => {
			if ($.get(activeThemeName) === 'lime') $$render(consequent); else if ($.get(activeThemeName) === 'noor') $$render(consequent_1, 1); else $$render(alternate_5, -1);
		});
	}

	var node_26 = $.sibling(node, 2);

	{
		var consequent_32 = ($$anchor) => {
			var aside = root_36();
			let classes_1;
			var div_18 = $.child(aside);
			var div_19 = $.sibling(div_18, 2);
			var div_20 = $.child(div_19);
			var a_2 = $.child(div_20);
			var node_27 = $.child(a_2);

			{
				var consequent_16 = ($$anchor) => {
					var img = root_19();

					$.template_effect(
						($0) => {
							$.set_attribute(img, 'src', $0);
							$.set_attribute(img, 'alt', page?.data?.store?.name || 'Logo');
						},
						[() => getImageCDNUrl(page?.data?.store?.logo, 240, 0)]
					);

					$.append($$anchor, img);
				};

				var alternate_6 = ($$anchor) => {
					var span_1 = root_20();
					var text_5 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_5, page?.data?.store?.name || 'Svelte Commerce'));
					$.append($$anchor, span_1);
				};

				$.if(node_27, ($$render) => {
					if (page?.data?.store?.logo) $$render(consequent_16); else $$render(alternate_6, -1);
				});
			}

			$.reset(a_2);

			var node_28 = $.sibling(a_2, 2);

			Button(node_28, {
				variant: 'ghost',
				size: 'icon',
				'aria-label': 'Close sidebar',
				class: 'h-8 w-8 rounded-full bg-muted text-foreground hover:bg-muted/70',
				onclick: () => navModule.openSidebar = false,
				children: ($$anchor, $$slotProps) => {
					X($$anchor, { class: 'h-4 w-4' });
				},
				$$slots: { default: true }
			});

			$.reset(div_20);

			var div_21 = $.sibling(div_20, 2);
			var node_29 = $.child(div_21);

			{
				var consequent_18 = ($$anchor) => {
					var div_22 = root_22();
					var div_23 = $.child(div_22);
					var node_30 = $.child(div_23);

					{
						var consequent_17 = ($$anchor) => {
							var img_1 = root_21();

							$.template_effect(() => $.set_attribute(img_1, 'src', userState.user.avatar));
							$.append($$anchor, img_1);
						};

						var alternate_7 = ($$anchor) => {
							UserCircle($$anchor, { class: 'h-5 w-5' });
						};

						$.if(node_30, ($$render) => {
							if (userState.user?.avatar) $$render(consequent_17); else $$render(alternate_7, -1);
						});
					}

					$.reset(div_23);

					var div_24 = $.sibling(div_23, 2);
					var p_3 = $.child(div_24);
					var text_6 = $.only_child(p_3, true);
					var p_4 = $.sibling(p_3, 2);
					var text_7 = $.only_child(p_4, true);

					$.reset(div_24);
					$.reset(div_22);

					$.template_effect(() => {
						$.set_text(text_6, userState.user?.firstName || userState.user?.name || 'My Account');
						$.set_text(text_7, userState.user?.email || '');
					});

					$.append($$anchor, div_22);
				};

				var alternate_8 = ($$anchor) => {
					var div_25 = root_24();
					var node_31 = $.sibling($.child(div_25), 2);

					AuthButton(node_31, {
						'aria-label': 'Login',
						type: 'login',
						children: ($$anchor, $$slotProps) => {
							var div_26 = root_23();
							var node_32 = $.child(div_26);

							UserCircle(node_32, { class: 'h-4 w-4' });
							$.next(2);
							$.reset(div_26);
							$.append($$anchor, div_26);
						},
						$$slots: { default: true }
					});

					$.reset(div_25);
					$.append($$anchor, div_25);
				};

				$.if(node_29, ($$render) => {
					if (userState?.user?.role) $$render(consequent_18); else $$render(alternate_8, -1);
				});
			}

			$.reset(div_21);

			var div_27 = $.sibling(div_21, 2);
			var div_28 = $.child(div_27);
			var ul_1 = $.sibling($.child(div_28), 2);
			var li_3 = $.child(ul_1);
			var a_3 = $.child(li_3);
			var node_33 = $.child(a_3);

			Home(node_33, { class: 'h-4 w-4 text-muted-foreground' });
			$.next(2);
			$.reset(a_3);
			$.reset(li_3);

			var li_4 = $.sibling(li_3, 2);
			var a_4 = $.child(li_4);
			var node_34 = $.child(a_4);

			Tag(node_34, { class: 'h-4 w-4 text-muted-foreground' });
			$.next(2);
			$.reset(a_4);
			$.reset(li_4);
			$.reset(ul_1);
			$.reset(div_28);

			var node_35 = $.sibling(div_28, 2);

			{
				var consequent_21 = ($$anchor) => {
					var div_29 = root_30();
					var ul_2 = $.sibling($.child(div_29), 2);

					$.each(ul_2, 21, () => navModule.navMenu, $.index, ($$anchor, menuItem, i) => {
						var li_5 = root_29();
						var node_36 = $.child(li_5);

						{
							var consequent_20 = ($$anchor) => {
								var fragment_12 = root_27();
								var div_30 = $.first_child(fragment_12);
								var a_5 = $.child(div_30);
								var node_37 = $.child(a_5);

								Layers(node_37, { class: 'h-4 w-4 text-muted-foreground' });

								var span_2 = $.sibling(node_37, 2);
								var text_8 = $.only_child(span_2, true);

								$.reset(a_5);

								var button = $.sibling(a_5, 2);
								var node_38 = $.child(button);

								{
									let $0 = $.derived(() => mobileNestOpen[i] ? '-rotate-180' : '');

									ChevronDown(node_38, {
										get class() {
											return `h-4 w-4 transition-transform duration-300 ${$.get($0) ?? ''}`;
										}
									});
								}

								$.reset(button);
								$.reset(div_30);

								var node_39 = $.sibling(div_30, 2);

								{
									var consequent_19 = ($$anchor) => {
										var ul_3 = root_26();

										$.each(ul_3, 21, () => $.get(menuItem).items, $.index, ($$anchor, child) => {
											var li_6 = root_25();
											var a_6 = $.child(li_6);
											var text_9 = $.only_child(a_6, true);

											$.reset(li_6);

											$.template_effect(() => {
												$.set_attribute(a_6, 'href', $.get(child)?.link || ($.get(child)?.slug ? '/' + $.get(child).slug : '/products'));
												$.set_text(text_9, $.get(child).name);
											});

											$.delegated('click', a_6, () => navModule.openSidebar = false);
											$.append($$anchor, li_6);
										});

										$.reset(ul_3);
										$.append($$anchor, ul_3);
									};

									$.if(node_39, ($$render) => {
										if (mobileNestOpen[i]) $$render(consequent_19);
									});
								}

								$.template_effect(() => {
									$.set_attribute(a_5, 'href', $.get(menuItem)?.link || ($.get(menuItem)?.slug ? '/' + $.get(menuItem).slug : '/products'));
									$.set_text(text_8, $.get(menuItem).name);
									$.set_attribute(button, 'aria-label', `Toggle ${$.get(menuItem).name ?? ''}`);
									$.set_attribute(button, 'aria-expanded', mobileNestOpen[i] ? 'true' : 'false');
								});

								$.delegated('click', a_5, () => navModule.openSidebar = false);
								$.delegated('click', button, () => toggleMobileNest(i));
								$.append($$anchor, fragment_12);
							};

							var alternate_9 = ($$anchor) => {
								var a_7 = root_28();
								var node_40 = $.child(a_7);

								Layers(node_40, { class: 'h-4 w-4 text-muted-foreground' });

								var span_3 = $.sibling(node_40, 2);
								var text_10 = $.only_child(span_3, true);

								$.reset(a_7);

								$.template_effect(() => {
									$.set_attribute(a_7, 'href', $.get(menuItem)?.link);
									$.set_text(text_10, $.get(menuItem).name);
								});

								$.delegated('click', a_7, () => navModule.openSidebar = false);
								$.append($$anchor, a_7);
							};

							$.if(node_36, ($$render) => {
								if ($.get(menuItem)?.items?.length) $$render(consequent_20); else $$render(alternate_9, -1);
							});
						}

						$.reset(li_5);
						$.append($$anchor, li_5);
					});

					$.reset(ul_2);
					$.reset(div_29);
					$.append($$anchor, div_29);
				};

				$.if(node_35, ($$render) => {
					if (navModule.navMenu?.length) $$render(consequent_21);
				});
			}

			var div_31 = $.sibling(node_35, 2);
			var ul_4 = $.sibling($.child(div_31), 2);
			var node_41 = $.child(ul_4);

			{
				var consequent_27 = ($$anchor) => {
					var fragment_13 = $.comment();
					var node_42 = $.first_child(fragment_13);

					$.each(node_42, 17, () => $.get(menuItemsUser), $.index, ($$anchor, m) => {
						var li_7 = root_31();
						var a_8 = $.child(li_7);
						var node_43 = $.child(a_8);

						{
							var consequent_22 = ($$anchor) => {
								UserCircle($$anchor, { class: 'h-4 w-4 text-muted-foreground' });
							};

							var consequent_23 = ($$anchor) => {
								Package($$anchor, { class: 'h-4 w-4 text-muted-foreground' });
							};

							var consequent_24 = ($$anchor) => {
								MapPin($$anchor, { class: 'h-4 w-4 text-muted-foreground' });
							};

							var consequent_25 = ($$anchor) => {
								KeyRound($$anchor, { class: 'h-4 w-4 text-muted-foreground' });
							};

							var consequent_26 = ($$anchor) => {
								Heart($$anchor, { class: 'h-4 w-4 text-muted-foreground' });
							};

							$.if(node_43, ($$render) => {
								if ($.get(m).title === 'Profile') $$render(consequent_22); else if ($.get(m).title === 'Orders') $$render(consequent_23, 1); else if ($.get(m).title === 'Addresses') $$render(consequent_24, 2); else if ($.get(m).title === 'Change Password') $$render(consequent_25, 3); else if ($.get(m).title === 'Wishlist') $$render(consequent_26, 4);
							});
						}

						var span_4 = $.sibling(node_43, 2);
						var text_11 = $.only_child(span_4, true);

						$.reset(a_8);
						$.reset(li_7);

						$.template_effect(() => {
							$.set_attribute(a_8, 'href', $.get(m).url);
							$.set_text(text_11, $.get(m).title);
						});

						$.delegated('click', a_8, () => navModule.openSidebar = false);
						$.append($$anchor, li_7);
					});

					$.append($$anchor, fragment_13);
				};

				$.if(node_41, ($$render) => {
					if ($.get(menuItemsUser)?.length) $$render(consequent_27);
				});
			}

			var node_44 = $.sibling(node_41, 2);

			{
				var consequent_28 = ($$anchor) => {
					var li_8 = root_32();
					var button_1 = $.child(li_8);
					var node_45 = $.child(button_1);

					LogOut(node_45, { class: 'h-4 w-4 text-destructive/70' });
					$.next(2);
					$.reset(button_1);
					$.reset(li_8);

					$.delegated('click', button_1, () => {
						navModule.openSidebar = false;
						navModule.handleSignOut();
					});

					$.append($$anchor, li_8);
				};

				$.if(node_44, ($$render) => {
					if (userState?.user?.role) $$render(consequent_28);
				});
			}

			$.reset(ul_4);
			$.reset(div_31);
			$.reset(div_27);

			var node_46 = $.sibling(div_27, 2);

			{
				var consequent_31 = ($$anchor) => {
					var div_32 = root_35();
					var div_33 = $.sibling($.child(div_32), 2);
					var node_47 = $.child(div_33);

					{
						var consequent_29 = ($$anchor) => {
							var a_9 = root_33();
							var node_48 = $.child(a_9);

							Mail(node_48, { class: 'h-3.5 w-3.5 text-muted-foreground' });

							var span_5 = $.sibling(node_48, 2);
							var text_12 = $.only_child(span_5, true);

							$.reset(a_9);

							$.template_effect(() => {
								$.set_attribute(a_9, 'href', `mailto:${page?.data?.store?.businessEmail ?? ''}`);
								$.set_text(text_12, page?.data?.store?.businessEmail);
							});

							$.append($$anchor, a_9);
						};

						$.if(node_47, ($$render) => {
							if (page?.data?.store?.businessEmail) $$render(consequent_29);
						});
					}

					var node_49 = $.sibling(node_47, 2);

					{
						var consequent_30 = ($$anchor) => {
							var a_10 = root_34();
							var node_50 = $.child(a_10);

							Phone(node_50, { class: 'h-3.5 w-3.5 text-muted-foreground' });

							var span_6 = $.sibling(node_50, 2);
							var text_13 = $.only_child(span_6);

							$.reset(a_10);

							$.template_effect(() => {
								$.set_attribute(a_10, 'href', `tel:+${page?.data?.store?.businessPhone ?? ''}`);
								$.set_text(text_13, `+${page?.data?.store?.businessPhone ?? ''}`);
							});

							$.append($$anchor, a_10);
						};

						$.if(node_49, ($$render) => {
							if (page?.data?.store?.businessPhone) $$render(consequent_30);
						});
					}

					$.reset(div_33);
					$.reset(div_32);
					$.append($$anchor, div_32);
				};

				$.if(node_46, ($$render) => {
					if (page?.data?.store?.businessEmail || page?.data?.store?.businessPhone) $$render(consequent_31);
				});
			}

			$.reset(div_19);
			$.reset(aside);
			$.template_effect(() => classes_1 = $.set_class(aside, 1, 'fixed inset-0 z-[100] flex overflow-hidden bg-transparent font-sans svelte-d9v6bn', null, classes_1, { ed: $.get(activeThemeName) === 'default' }));

			$.delegated('click', div_18, () => {
				navModule.openSidebar = false;
			});

			$.delegated('keydown', div_18, (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					navModule.openSidebar = false;
				}
			});

			$.transition(1, div_18, () => fade, () => ({ duration: 300 }));
			$.transition(2, div_18, () => fade, () => ({ duration: 300 }));
			$.delegated('click', a_2, () => navModule.openSidebar = false);
			$.delegated('click', a_3, () => navModule.openSidebar = false);
			$.delegated('click', a_4, () => navModule.openSidebar = false);
			$.transition(1, div_19, () => fly, () => ({ x: -320, duration: 300, easing: cubicOut }));
			$.transition(2, div_19, () => fly, () => ({ x: -320, duration: 300, easing: cubicOut }));
			$.append($$anchor, aside);
		};

		$.if(node_26, ($$render) => {
			if (navModule.openSidebar) $$render(consequent_32);
		});
	}

	var node_51 = $.sibling(node_26, 2);

	AuthModal(node_51, {
		get show() {
			return navModule.showAuthModal;
		},

		set show($$value) {
			navModule.showAuthModal = $$value;
		}
	});

	$.bind_window_scroll('y', () => navModule.scrollY, ($$value) => navModule.scrollY = $$value);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);