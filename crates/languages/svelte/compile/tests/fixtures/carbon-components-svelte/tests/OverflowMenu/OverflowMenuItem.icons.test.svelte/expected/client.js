import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";
import Edit from "carbon-icons-svelte/lib/Edit.svelte";
import Launch from "carbon-icons-svelte/lib/Launch.svelte";

var root = $.from_svg(`<svg slot="iconRight" data-testid="slot-icon-right"></svg>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function OverflowMenuItem_icons_test($$anchor) {
	OverflowMenu($$anchor, {
		open: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			OverflowMenuItem(node, {
				get icon() {
					return Edit;
				},

				get iconRight() {
					return Launch;
				},
				text: 'Both icons'
			});

			var node_1 = $.sibling(node, 2);

			OverflowMenuItem(node_1, {
				text: 'Slot icon',
				$$slots: {
					iconRight: ($$anchor, $$slotProps) => {
						var svg = root();

						$.append($$anchor, svg);
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			OverflowMenuItem(node_2, { text: 'No icons' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}