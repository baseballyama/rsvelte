import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OverflowMenu, OverflowMenuItem } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function OverflowMenuScrollable($$anchor) {
	const workspaces = Array.from({ length: 20 }, (_, index) => `Workspace ${index + 1}`);

	OverflowMenu($$anchor, {
		maxHeight: 240,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => workspaces, (workspace) => workspace, ($$anchor, workspace) => {
				OverflowMenuItem($$anchor, {
					get text() {
						return workspace;
					}
				});
			});

			var node_1 = $.sibling(node, 2);

			OverflowMenuItem(node_1, { hasDivider: true, danger: true, text: 'Delete service' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}