import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from "carbon-components-svelte/UIShell/Header.svelte";
import HeaderNav from "carbon-components-svelte/UIShell/HeaderNav.svelte";
import HeaderNavItem from "carbon-components-svelte/UIShell/HeaderNavItem.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

var root = $.from_html(`<span slot="icon" data-testid="slot-icon" aria-hidden="true">↗</span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function HeaderNavItemIcon_test($$anchor) {
	Header($$anchor, {
		companyName: 'Test',
		platformName: 'Test',
		children: ($$anchor, $$slotProps) => {
			HeaderNav($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					HeaderNavItem(node, { href: '/catalog', text: 'Catalog' });

					var node_1 = $.sibling(node, 2);

					HeaderNavItem(node_1, {
						href: 'https://example.com/docs',
						target: '_blank',
						text: 'Docs',
						get icon() {
							return Launch;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					HeaderNavItem(node_2, {
						href: 'https://example.com/status',
						target: '_blank',
						text: 'Status',
						$$slots: {
							icon: ($$anchor, $$slotProps) => {
								var span = root();

								$.append($$anchor, span);
							}
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}