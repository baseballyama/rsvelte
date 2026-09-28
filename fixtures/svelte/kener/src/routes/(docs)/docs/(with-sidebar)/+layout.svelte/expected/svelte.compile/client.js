import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsSidebar from "../DocsSidebar.svelte";
import DocsNavbar from "../DocsNavbar.svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<link rel="icon"/>`);
var root_1 = $.from_html(`<div class="fixed inset-0 top-24 z-35 bg-black/50 lg:hidden" role="presentation"></div>`);
var root_2 = $.from_html(`<div class="bg-background text-foreground min-h-screen"><!> <div class="mx-auto flex px-0 pt-24"><!> <aside><!></aside> <div class="min-w-0 flex-1 p-6 px-8 lg:ml-[240px] lg:p-8 lg:px-8"><!></div></div></div>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let isMobileMenuOpen = $.state(false);

	function toggleMobileMenu() {
		$.set(isMobileMenuOpen, !$.get(isMobileMenuOpen));
	}

	function closeMobileMenu() {
		$.set(isMobileMenuOpen, false);
	}

	var div = root_2();

	$.head('1p7vac9', ($$anchor) => {
		var link = root();

		$.template_effect(($0) => $.set_attribute(link, 'href', $0), [
			() => $$props.data.config.favicon
				? clientResolver(resolve, $$props.data.config.favicon)
				: $$props.data.config.favicon
		]);

		$.append($$anchor, link);
	});

	var node = $.child(div);

	DocsNavbar(node, {
		get config() {
			return $$props.data.config;
		},

		get currentSlug() {
			return $$props.data.currentSlug;
		},
		onMenuToggle: toggleMobileMenu,
		get isMobileMenuOpen() {
			return $.get(isMobileMenuOpen);
		}
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_1();

			$.delegated('click', div_2, closeMobileMenu);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isMobileMenuOpen)) $$render(consequent);
		});
	}

	var aside = $.sibling(node_1, 2);
	let classes;
	var node_2 = $.child(aside);

	DocsSidebar(node_2, {
		get config() {
			return $$props.data.config;
		},

		get currentSlug() {
			return $$props.data.currentSlug;
		},
		onNavigate: closeMobileMenu
	});

	$.reset(aside);

	var div_3 = $.sibling(aside, 2);
	var node_3 = $.child(div_3);

	$.snippet(node_3, () => $$props.children);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => classes = $.set_class(aside, 1, 'bg-background scrollbar-hidden fixed top-24 bottom-0 left-0 z-40 w-[240px] -translate-x-full overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0', null, classes, { 'translate-x-0': $.get(isMobileMenuOpen) }));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);