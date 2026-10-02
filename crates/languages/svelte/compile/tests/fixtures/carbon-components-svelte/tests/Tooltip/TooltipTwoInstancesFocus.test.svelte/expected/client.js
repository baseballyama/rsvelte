import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

var root = $.from_html(`<p><a href="/first">Learn more</a></p>`);
var root_1 = $.from_html(`<p>Second tooltip content</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function TooltipTwoInstancesFocus_test($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Tooltip(node, {
		triggerText: 'First',
		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tooltip(node_1, {
		triggerText: 'Second',
		children: ($$anchor, $$slotProps) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}