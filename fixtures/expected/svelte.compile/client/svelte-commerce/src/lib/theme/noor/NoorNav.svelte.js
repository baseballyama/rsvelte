import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Heart, Menu, UserRound } from '@lucide/svelte';
import MsSearch from '$lib/components/nav/ms-search.svelte';
import CartSidebar from '$lib/components/nav/cart-sidebar.svelte';
import ProfileDropdown from '$lib/components/nav/profile-dropdown.svelte';
import AuthButton from '$lib/components/auth/auth-button.svelte';

var root = $.from_html(`<section class="noor-announcement svelte-loucq3"> </section>`);
var root_1 = $.from_html(`<img class="svelte-loucq3"/>`);
var root_2 = $.from_html(`<span class="noor-wordmark svelte-loucq3"> </span>`);
var root_3 = $.from_html(`<span class="absolute right-0 top-0 inline-flex -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary px-1.5 py-1 text-xs font-bold leading-none text-primary-foreground"> </span>`);
var root_4 = $.from_html(`<div class="relative hidden items-center justify-center sm:flex" role="navigation"><a href="/my/wishlist" class="flex items-center justify-center text-[#151515] hover:text-black" aria-label="Wishlist"><!> <!></a></div>`);
var root_5 = $.from_html(`<div class="flex items-center justify-center text-[#151515] hover:text-black"><!></div>`);
var root_6 = $.from_html(`<a class="svelte-loucq3"> </a>`);
var root_7 = $.from_html(`<!> <header class="noor-header shadow-xs svelte-loucq3"><div class="noor-header-main svelte-loucq3"><button class="noor-mobile-trigger svelte-loucq3" aria-label="Toggle menu"><!></button> <a href="/" class="noor-logo svelte-loucq3"><!></a> <div class="noor-actions svelte-loucq3"><!> <!> <div class="noor-account flex items-center svelte-loucq3"><!></div> <!></div></div> <nav class="noor-nav svelte-loucq3"></nav></header>`, 1);

export default function NoorNav($$anchor, $$props) {
	$.push($$props, true);

	let navModule = $.prop($$props, 'navModule', 7),
		pathname = $.prop($$props, 'pathname', 3, '');

	// Header chrome is store-editable theme content.
	const navLinks = $.derived(() => $$props.themeContent?.nav?.links ?? []);

	const announcement = $.derived(() => $$props.themeContent?.nav?.announcement ?? '');
	const brandName = $.derived(() => $$props.storeData?.name || $$props.themeContent?.brandName || 'Store');
	var fragment = root_7();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var section = root();
			var text = $.only_child(section, true);

			$.template_effect(() => $.set_text(text, $.get(announcement)));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(announcement)) $$render(consequent);
		});
	}

	var header = $.sibling(node, 2);
	var div = $.child(header);
	var button = $.child(div);
	var node_1 = $.child(button);

	Menu(node_1, { class: 'h-5 w-5' });
	$.reset(button);

	var a = $.sibling(button, 2);
	var node_2 = $.child(a);

	{
		var consequent_1 = ($$anchor) => {
			var img = root_1();

			$.template_effect(() => {
				$.set_attribute(img, 'src', $$props.storeData.logo);
				$.set_attribute(img, 'alt', $.get(brandName));
			});

			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var span = root_2();
			var text_1 = $.only_child(span, true);

			$.template_effect(() => $.set_text(text_1, $.get(brandName)));
			$.append($$anchor, span);
		};

		$.if(node_2, ($$render) => {
			if ($$props.storeData?.logo) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(a);

	var div_1 = $.sibling(a, 2);
	var node_3 = $.child(div_1);

	MsSearch(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_2 = root_4();
			var a_1 = $.child(div_2);
			var node_5 = $.child(a_1);

			Heart(node_5, { class: 'h-5 w-5' });

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_1 = root_3();
					var text_2 = $.only_child(span_1, true);

					$.template_effect(() => $.set_text(text_2, $$props.wishlistState.count));
					$.append($$anchor, span_1);
				};

				$.if(node_6, ($$render) => {
					if ($$props.wishlistState?.count > 0) $$render(consequent_2);
				});
			}

			$.reset(a_1);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if ($$props.wishlistPlugin?.active) $$render(consequent_3);
		});
	}

	var div_3 = $.sibling(node_4, 2);
	var node_7 = $.child(div_3);

	{
		var consequent_4 = ($$anchor) => {
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
					var div_4 = root_5();
					var node_8 = $.child(div_4);

					UserRound(node_8, { class: 'h-5 w-5' });
					$.reset(div_4);
					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_7, ($$render) => {
			if ($$props.userState?.user?.role) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_3);

	var node_9 = $.sibling(div_3, 2);

	{
		var consequent_5 = ($$anchor) => {
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
			if ($.get(d)) $$render(consequent_5);
		});
	}

	$.reset(div_1);
	$.reset(div);

	var nav = $.sibling(div, 2);

	$.each(nav, 21, () => $.get(navLinks), $.index, ($$anchor, item) => {
		var a_2 = root_6();
		var text_3 = $.only_child(a_2, true);

		$.template_effect(() => {
			$.set_attribute(a_2, 'href', $.get(item).href);
			$.set_text(text_3, $.get(item).label);
		});

		$.append($$anchor, a_2);
	});

	$.reset(nav);
	$.reset(header);

	$.template_effect(() => {
		$.set_attribute(a, 'aria-label', `${$.get(brandName) ?? ''} home`);
		$.set_attribute(nav, 'aria-label', `${$.get(brandName) ?? ''} categories`);
	});

	$.delegated('click', button, () => {
		navModule().openSidebar = true;
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);