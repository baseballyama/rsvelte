import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heart, MapPin, Menu, UserRound } from '@lucide/svelte';
import MsSearch from '$lib/components/nav/ms-search.svelte';
import CartSidebar from '$lib/components/nav/cart-sidebar.svelte';
import ProfileDropdown from '$lib/components/nav/profile-dropdown.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';

var root = $.from_html(`<img class="svelte-3tnr1h"/>`);
var root_1 = $.from_html(`<span class="lime-wordmark svelte-3tnr1h"> </span>`);
var root_2 = $.from_html(`<a class="svelte-3tnr1h"> </a>`);
var root_3 = $.from_html(`<span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground"> </span>`);
var root_4 = $.from_html(`<div class="relative flex items-center justify-center" role="navigation"><a href="/my/wishlist" class="flex items-center justify-center text-gray-700 hover:text-black svelte-3tnr1h" aria-label="Wishlist"><!> <!></a></div>`);
var root_5 = $.from_html(`<div class="flex items-center justify-center text-gray-700 hover:text-black"><!></div>`);
var root_6 = $.from_html(`<section class="lime-topbar svelte-3tnr1h"><a class="lime-find-store svelte-3tnr1h"><!> <span> </span></a></section> <header class="lime-header shadow-xs svelte-3tnr1h"><button class="lime-mobile-trigger svelte-3tnr1h" aria-label="Toggle menu"><!></button> <a class="lime-logo svelte-3tnr1h" href="/"><!></a> <nav class="lime-nav svelte-3tnr1h" aria-label="Main navigation"></nav> <div class="lime-actions svelte-3tnr1h"><!> <!> <div class="lime-account flex items-center svelte-3tnr1h"><!></div> <!></div></header>`, 1);

export default function LimeNav($$anchor, $$props) {
	$.push($$props, true);

	let navModule = $.prop($$props, 'navModule', 7),
		pathname = $.prop($$props, 'pathname', 3, '');

	// Header chrome is store-editable theme content; the literals below are only the
	// fallback for a store whose theme content has not been resolved yet.
	const navLinks = $.derived(() => $$props.themeContent?.nav?.links ?? []);

	const storeCtaLabel = $.derived(() => $$props.themeContent?.nav?.ctaLabel ?? 'Find a Store');
	const storeCtaHref = $.derived(() => $$props.themeContent?.nav?.ctaHref ?? '/store-locator');
	const brandName = $.derived(() => $$props.storeData?.name || $$props.themeContent?.brandName || 'Store');
	var fragment = root_6();
	var section = $.first_child(fragment);
	var a = $.child(section);
	var node = $.child(a);

	MapPin(node, { class: 'h-4 w-4' });

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);

	$.reset(a);
	$.reset(section);

	var header = $.sibling(section, 2);
	var button = $.child(header);
	var node_1 = $.child(button);

	Menu(node_1, { class: 'h-5 w-5' });
	$.reset(button);

	var a_1 = $.sibling(button, 2);
	var node_2 = $.child(a_1);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $$props.storeData.logo);
				$.set_attribute(img, 'alt', $.get(brandName));
			});

			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var span_1 = root_1();
			var text_1 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_1, $.get(brandName)));
			$.append($$anchor, span_1);
		};

		$.if(node_2, ($$render) => {
			if ($$props.storeData?.logo) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(a_1);

	var nav = $.sibling(a_1, 2);

	$.each(nav, 21, () => $.get(navLinks), $.index, ($$anchor, item) => {
		var a_2 = root_2();
		var text_2 = $.only_child(a_2, true);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', $.get(item).href);
			$.set_text(text_2, $.get(item).label);
		});

		$.append($$anchor, a_2);
	});

	$.reset(nav);

	var div = $.sibling(nav, 2);
	var node_3 = $.child(div);

	MsSearch(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_1 = root_4();
			var a_3 = $.child(div_1);
			var node_5 = $.child(a_3);

			Heart(node_5, { class: 'h-5 w-5' });

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_1 = ($$anchor) => {
					var span_2 = root_3();
					var text_3 = $.only_child(span_2, true);

					$.template_effect(() => $.set_text(text_3, $$props.wishlistState.count));
					$.append($$anchor, span_2);
				};

				$.if(node_6, ($$render) => {
					if ($$props.wishlistState?.count > 0) $$render(consequent_1);
				});
			}

			$.reset(a_3);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_4, ($$render) => {
			if ($$props.wishlistPlugin?.active) $$render(consequent_2);
		});
	}

	var div_2 = $.sibling(node_4, 2);
	var node_7 = $.child(div_2);

	{
		var consequent_3 = ($$anchor) => {
			ProfileDropdown($$anchor, {
				get onSignOut() {
					return navModule().handleSignOut;
				}
			});
		};

		var alternate_1 = ($$anchor) => {
			AuthButton($$anchor, {
				'aria-label': 'Login',
				type: 'login',
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_5();
					var node_8 = $.child(div_3);

					UserRound(node_8, { class: 'h-5 w-5' });
					$.reset(div_3);
					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_7, ($$render) => {
			if ($$props.userState?.user?.role) $$render(consequent_3); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_2);

	var node_9 = $.sibling(div_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			CartSidebar($$anchor, {
				get onClose() {
					return navModule().closeCartSidebar;
				},

				get onContinueShopping() {
					return navModule().handleContinueShoppingClick;
				},

				get onRemoveCartItem() {
					return navModule().removeCartItem;
				}
			});
		};

		var d = $.derived(() => !pathname().startsWith('/checkout'));

		$.if(node_9, ($$render) => {
			if ($.get(d)) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.reset(header);

	$.template_effect(() => {
		$.set_attribute(a, 'href', $.get(storeCtaHref));
		$.set_text(text, $.get(storeCtaLabel));
	});

	$.delegated('click', button, () => {
		navModule().openSidebar = true;
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);