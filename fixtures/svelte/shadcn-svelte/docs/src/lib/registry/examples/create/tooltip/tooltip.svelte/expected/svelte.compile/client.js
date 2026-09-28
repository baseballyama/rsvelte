import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TooltipBasic from "./tooltip-basic.svelte";
import TooltipDisabled from "./tooltip-disabled.svelte";
import TooltipFormatted from "./tooltip-formatted.svelte";
import TooltipLongContent from "./tooltip-long-content.svelte";
import TooltipOnLink from "./tooltip-on-link.svelte";
import TooltipSides from "./tooltip-sides.svelte";
import TooltipWithIcon from "./tooltip-with-icon.svelte";
import TooltipWithKeyboard from "./tooltip-with-keyboard.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tooltip($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TooltipBasic(node, {});

			var node_1 = $.sibling(node, 2);

			TooltipSides(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			TooltipWithIcon(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			TooltipLongContent(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			TooltipDisabled(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			TooltipWithKeyboard(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			TooltipOnLink(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			TooltipFormatted(node_7, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}