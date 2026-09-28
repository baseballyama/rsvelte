import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<meta name="robots" content="noindex, nofollow"/>`);
var root_1 = $.from_html(`<span class="sr-only">Close menu</span>`);
var root_2 = $.from_html(`<div class="fixed inset-0 z-20 md:hidden"><!></div>`);
var root_3 = $.from_html(`<!> `, 1);
var root_4 = $.from_html(`<!> <!> <div class="page-width relative flex min-h-screen flex-col overflow-hidden p-0 md:flex-row md:p-0"><!> <aside><nav class="relative top-[5rem] space-y-2 p-6 pt-10 md:top-0 md:pt-12"></nav></aside> <main id="main" class="flex-1 overflow-y-auto px-2 md:px-6 svelte-brkybl"><div class="mb-4 block flex justify-start items-center max-md:flex max-md:gap-2"><!> <div class="md:hidden"><!></div></div> <!></main></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let isMobileMenuOpen = $.state(false);

	// The sidebar is a slide-in drawer below `md` and always-visible above it. `inert` is an HTML
	// attribute and cannot be media-queried, so the breakpoint has to be readable here. Matches the
	// Tailwind `md` breakpoint used on the <aside> below. Defaults to true so the nav is never
	// inert during SSR or before the listener attaches.
	let isDesktop = $.state(true);

	$.user_effect(() => {
		const mq = window.matchMedia('(min-width: 768px)');

		const sync = () => {
			$.set(isDesktop, mq.matches, true);
		};

		sync();
		mq.addEventListener('change', sync);

		return () => mq.removeEventListener('change', sync);
	});

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

		if ($.get(wishlistPlugin)?.active) items.push({ href: '/my/wishlist', icon: Heart, label: 'Wishlist' });

		return items;
	});

	let breadcrumbItems = $.state($.proxy([]));

	// Generate breadcrumb items based on current route
	$.user_effect(() => {
		$.set(
			breadcrumbItems,
			page.url.pathname.split('/').filter(Boolean).map((path, index, arr) => {
				const href = `/${arr.slice(0, index + 1).join('/')}`;

				// Convert path to readable label (e.g., 'my-orders' -> 'My Orders')
				const label = path.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

				return { label, href };
			}),
			true
		);
	});

	var fragment = root_4();

	$.head('brkybl', ($$anchor) => {
		var meta = root();

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	StorePlugins(node, {});

	var node_1 = $.sibling(node, 2);

	Nav(node_1, {});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_2();
			var node_3 = $.child(div_1);

			Button(node_3, {
				variant: 'ghost',
				class: 'h-full w-full rounded-none bg-black/30 p-0 hover:bg-black/30',
				onclick: () => $.set(isMobileMenuOpen, false),
				children: ($$anchor, $$slotProps) => {
					var span = root_1();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.transition(3, div_1, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isMobileMenuOpen)) $$render(consequent);
		});
	}

	var aside = $.sibling(node_2, 2);
	let classes;
	var nav = $.child(aside);

	$.each(nav, 21, () => $.get(menuItems), $.index, ($$anchor, $$item) => {
		let href = () => $.get($$item).href;
		let Icon = () => $.get($$item).icon;
		let label = () => $.get($$item).label;
		const isActive = $.derived(() => page.url.pathname === href() || page.url.pathname.startsWith(href()) && href() !== '/my');

		{
			let $0 = $.derived(() => $.get(isActive) ? 'default' : 'ghost');

			Button($$anchor, {
				get href() {
					return href();
				},

				get variant() {
					return $.get($0);
				},
				class: 'w-full justify-start',
				onclick: () => $.set(isMobileMenuOpen, false),
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_3();
					var node_4 = $.first_child(fragment_2);

					$.component(node_4, Icon, ($$anchor, Icon_1) => {
						Icon_1($$anchor, { class: 'mr-4 h-5 w-5' });
					});

					var text = $.sibling(node_4);

					$.template_effect(() => $.set_text(text, ` ${label() ?? ''}`));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(nav);
	$.reset(aside);

	var main = $.sibling(aside, 2);
	var div_2 = $.child(main);
	var node_5 = $.child(div_2);

	Button(node_5, {
		variant: 'ghost',
		size: 'icon',
		class: 'md:hidden',
		onclick: () => $.set(isMobileMenuOpen, !$.get(isMobileMenuOpen)),
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			{
				var consequent_1 = ($$anchor) => {
					X($$anchor, { class: 'h-4 w-4' });
				};

				var alternate = ($$anchor) => {
					Menu($$anchor, { class: 'h-4 w-4' });
				};

				$.if(node_6, ($$render) => {
					if ($.get(isMobileMenuOpen)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node_5, 2);
	var node_7 = $.child(div_3);

	Breadcrumb(node_7, {
		get items() {
			return $.get(breadcrumbItems);
		}
	});

	$.reset(div_3);
	$.reset(div_2);

	var node_8 = $.sibling(div_2, 2);

	$.snippet(node_8, () => $$props.children);
	$.reset(main);
	$.reset(div);

	var node_9 = $.sibling(div, 2);

	Footer(node_9, {});

	$.template_effect(() => {
		classes = $.set_class(
			aside,
			1,
			`fixed left-0 top-0 z-30 h-full w-[80%] max-w-xs transform  bg-white transition-all duration-300 ease-in-out md:sticky md:w-72 md:translate-x-0 ${$.get(isMobileMenuOpen)
				? 'translate-x-0 shadow-2xl'
				: '-translate-x-full md:shadow-none'}`,
			'svelte-brkybl',
			classes,
			{ 'md:relative': true }
		);

		nav.inert = !$.get(isMobileMenuOpen) && !$.get(isDesktop);
	});

	$.append($$anchor, fragment);
	$.pop();
}