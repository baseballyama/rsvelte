import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function OverflowMenu_preventDefault_test($$anchor) {
	OverflowMenu($$anchor, {
		$$events: {
			close: (e) => {
				console.log("close", e.detail);
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			OverflowMenuItem(node, {
				text: 'Manage credentials',
				$$events: {
					click: (e) => {
						console.log("click", "Manage credentials");
						e.preventDefault(); // Prevent menu from closing
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			OverflowMenuItem(node_1, {
				href: 'https://cloud.ibm.com/docs/api-gateway/',
				text: 'API documentation',
				$$events: {
					click: () => {
						console.log("click", "API documentation");
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			OverflowMenuItem(node_2, {
				danger: true,
				text: 'Delete service',
				$$events: {
					click: () => {
						console.log("click", "Delete service");
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}