import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

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

		let isMobileMenuOpen = false;

		const toggleMobileMenu = () => {
			isMobileMenuOpen = !isMobileMenuOpen;
		};

		const closeMobileMenu = () => {
			isMobileMenuOpen = false;
		};

		$$renderer.push(`<button class="sidebar-toggle svelte-181dlmc" aria-label="Toggle sidebar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"></path></svg> Menu</button> <aside${$.attr_class('sidebar svelte-181dlmc', void 0, { 'open': isMobileMenuOpen })}><div class="sidebar-header svelte-181dlmc"><a href="/docs" class="sidebar-brand svelte-181dlmc">Documentation</a> <button class="sidebar-close svelte-181dlmc" aria-label="Close sidebar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg></button></div> <nav class="sidebar-nav svelte-181dlmc"><!--[-->`);

		const each_array = $.ensure_array_like(navigation);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let section = each_array[$$index_1];

			$$renderer.push(`<div class="nav-section"><h4 class="nav-section-title svelte-181dlmc">${$.escape(section.title)}</h4> <ul class="nav-list svelte-181dlmc"><!--[-->`);

			const each_array_1 = $.ensure_array_like(section.items);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let item = each_array_1[$$index];

				$$renderer.push(`<li><a${$.attr('href', item.href)}${$.attr_class('nav-link svelte-181dlmc', void 0, {
					'active': $.store_get($$store_subs ??= {}, '$page', page).url.pathname === item.href
				})}>${$.escape(item.title)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></div>`);
		}

		$$renderer.push(`<!--]--></nav></aside> `);

		if (isMobileMenuOpen) {
			$$renderer.push(`<!--[0--><button class="sidebar-overlay svelte-181dlmc" aria-label="Close menu"></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}