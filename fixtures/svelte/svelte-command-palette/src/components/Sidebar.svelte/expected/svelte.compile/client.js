import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';

var root = $.from_html(`<li><a> </a></li>`);
var root_1 = $.from_html(`<div class="nav-section"><h4 class="nav-section-title svelte-181dlmc"> </h4> <ul class="nav-list svelte-181dlmc"></ul></div>`);
var root_2 = $.from_html(`<button class="sidebar-overlay svelte-181dlmc" aria-label="Close menu"></button>`);
var root_3 = $.from_html(`<button class="sidebar-toggle svelte-181dlmc" aria-label="Toggle sidebar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> Menu</button> <aside><div class="sidebar-header svelte-181dlmc"><a href="/docs" class="sidebar-brand svelte-181dlmc">Documentation</a> <button class="sidebar-close svelte-181dlmc" aria-label="Close sidebar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button></div> <nav class="sidebar-nav svelte-181dlmc"></nav></aside> <!>`, 1);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const navigation = [
		{
			title: 'Getting Started',
			items: [
				{ title: 'Installation', href: '/docs/installation' },
				{ title: 'Quick Start', href: '/docs/quick-start' }
			]
		},

		{
			title: 'Core Concepts',
			items: [
				{ title: 'Defining Actions', href: '/docs/define-actions' },
				{ title: 'Keyboard Shortcuts', href: '/docs/shortcuts' },
				{ title: 'Palette Store', href: '/docs/palette-store' }
			]
		},

		{
			title: 'Customization',
			items: [
				{ title: 'Styling', href: '/docs/styling' },
				{ title: 'Theming', href: '/docs/theming' },
				{ title: 'Custom Components', href: '/docs/custom-components' }
			]
		},

		{
			title: 'API Reference',
			items: [
				{ title: 'CommandPalette', href: '/docs/command-palette-api' },
				{ title: 'defineActions', href: '/docs/define-actions-api' },
				{ title: 'createStoreMethods', href: '/docs/store-methods-api' }
			]
		}
	];

	let isMobileMenuOpen = $.state(false);

	const toggleMobileMenu = () => {
		$.set(isMobileMenuOpen, !$.get(isMobileMenuOpen));
	};

	const closeMobileMenu = () => {
		$.set(isMobileMenuOpen, false);
	};

	var fragment = root_3();
	var button = $.first_child(fragment);
	var aside = $.sibling(button, 2);
	let classes;
	var div = $.child(aside);
	var a = $.child(div);
	var button_1 = $.sibling(a, 2);

	$.reset(div);

	var nav = $.sibling(div, 2);

	$.each(nav, 21, () => navigation, $.index, ($$anchor, section) => {
		var div_1 = root_1();
		var h4 = $.child(div_1);
		var text = $.only_child(h4, true);
		var ul = $.sibling(h4, 2);

		$.each(ul, 21, () => $.get(section).items, $.index, ($$anchor, item) => {
			var li = root();
			var a_1 = $.child(li);
			let classes_1;
			var text_1 = $.only_child(a_1, true);

			$.reset(li);

			$.template_effect(() => {
				$.set_attribute(a_1, 'href', $.get(item).href);
				classes_1 = $.set_class(a_1, 1, 'nav-link svelte-181dlmc', null, classes_1, { active: $page().url.pathname === $.get(item).href });
				$.set_text(text_1, $.get(item).title);
			});

			$.delegated('click', a_1, closeMobileMenu);
			$.append($$anchor, li);
		});

		$.reset(ul);
		$.reset(div_1);
		$.template_effect(() => $.set_text(text, $.get(section).title));
		$.append($$anchor, div_1);
	});

	$.reset(nav);
	$.reset(aside);

	var node = $.sibling(aside, 2);

	{
		var consequent = ($$anchor) => {
			var button_2 = root_2();

			$.delegated('click', button_2, closeMobileMenu);
			$.append($$anchor, button_2);
		};

		$.if(node, ($$render) => {
			if ($.get(isMobileMenuOpen)) $$render(consequent);
		});
	}

	$.template_effect(() => classes = $.set_class(aside, 1, 'sidebar svelte-181dlmc', null, classes, { open: $.get(isMobileMenuOpen) }));
	$.delegated('click', button, toggleMobileMenu);
	$.delegated('click', a, closeMobileMenu);
	$.delegated('click', button_1, closeMobileMenu);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);