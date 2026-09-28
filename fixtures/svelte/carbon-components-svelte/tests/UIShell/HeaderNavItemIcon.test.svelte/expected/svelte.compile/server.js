import * as $ from 'svelte/internal/server';
import Header from "carbon-components-svelte/UIShell/Header.svelte";
import HeaderNav from "carbon-components-svelte/UIShell/HeaderNav.svelte";
import HeaderNavItem from "carbon-components-svelte/UIShell/HeaderNavItem.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

export default function HeaderNavItemIcon_test($$renderer) {
	Header($$renderer, {
		companyName: 'Test',
		platformName: 'Test',
		children: ($$renderer) => {
			HeaderNav($$renderer, {
				children: ($$renderer) => {
					HeaderNavItem($$renderer, { href: '/catalog', text: 'Catalog' });
					$$renderer.push(`<!----> `);

					HeaderNavItem($$renderer, {
						href: 'https://example.com/docs',
						target: '_blank',
						text: 'Docs',
						icon: Launch
					});

					$$renderer.push(`<!----> `);

					HeaderNavItem($$renderer, {
						href: 'https://example.com/status',
						target: '_blank',
						text: 'Status',
						$$slots: {
							icon: ($$renderer) => {
								$$renderer.push(`<span slot="icon" data-testid="slot-icon" aria-hidden="true">↗</span>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}