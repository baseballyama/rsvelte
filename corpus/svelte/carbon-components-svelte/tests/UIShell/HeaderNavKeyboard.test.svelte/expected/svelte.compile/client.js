import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from "carbon-components-svelte/UIShell/Header.svelte";
import HeaderNav from "carbon-components-svelte/UIShell/HeaderNav.svelte";
import HeaderNavItem from "carbon-components-svelte/UIShell/HeaderNavItem.svelte";
import HeaderNavMenu from "carbon-components-svelte/UIShell/HeaderNavMenu.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function HeaderNavKeyboard_test($$anchor) {
	Header($$anchor, {
		companyName: 'Test',
		platformName: 'Test',
		children: ($$anchor, $$slotProps) => {
			HeaderNav($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					HeaderNavItem(node, { href: '/', text: 'Link 1' });

					var node_1 = $.sibling(node, 2);

					HeaderNavItem(node_1, { href: '/', text: 'Link 2' });

					var node_2 = $.sibling(node_1, 2);

					HeaderNavMenu(node_2, {
						text: 'Menu',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							HeaderNavItem(node_3, { href: '/item1', text: 'Menu Item 1' });

							var node_4 = $.sibling(node_3, 2);

							HeaderNavItem(node_4, { href: '/item2', text: 'Menu Item 2' });

							var node_5 = $.sibling(node_4, 2);

							HeaderNavItem(node_5, { href: '/item3', text: 'Menu Item 3' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}