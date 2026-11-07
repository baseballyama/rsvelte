import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ContextMenu, ContextMenuOption } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="context-target">Right click me</div> <!>`, 1);

export default function ContextMenuFixture($$anchor) {
	let target;
	let open = false;
	var fragment = root_1();
	var div = $.first_child(fragment);

	$.bind_this(div, ($$value) => target = $$value, () => target);

	var node = $.sibling(div, 2);

	ContextMenu(node, {
		open,
		get target() {
			return target;
		},

		set target($$value) {
			target = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ContextMenuOption(node_1, { labelText: 'Option 1' });

			var node_2 = $.sibling(node_1, 2);

			ContextMenuOption(node_2, { labelText: 'Option 2' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}