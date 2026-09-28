import * as $ from 'svelte/internal/server';
import Header from "carbon-components-svelte/UIShell/Header.svelte";
import HeaderNav from "carbon-components-svelte/UIShell/HeaderNav.svelte";
import HeaderNavItem from "carbon-components-svelte/UIShell/HeaderNavItem.svelte";
import HeaderNavMenu from "carbon-components-svelte/UIShell/HeaderNavMenu.svelte";

export default function HeaderNavKeyboard_test($$renderer) {
	Header($$renderer, {
		companyName: 'Test',
		platformName: 'Test',
		children: ($$renderer) => {
			HeaderNav($$renderer, {
				children: ($$renderer) => {
					HeaderNavItem($$renderer, { href: '/', text: 'Link 1' });
					$$renderer.push(`<!----> `);
					HeaderNavItem($$renderer, { href: '/', text: 'Link 2' });
					$$renderer.push(`<!----> `);

					HeaderNavMenu($$renderer, {
						text: 'Menu',
						children: ($$renderer) => {
							HeaderNavItem($$renderer, { href: '/item1', text: 'Menu Item 1' });
							$$renderer.push(`<!----> `);
							HeaderNavItem($$renderer, { href: '/item2', text: 'Menu Item 2' });
							$$renderer.push(`<!----> `);
							HeaderNavItem($$renderer, { href: '/item3', text: 'Menu Item 3' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}