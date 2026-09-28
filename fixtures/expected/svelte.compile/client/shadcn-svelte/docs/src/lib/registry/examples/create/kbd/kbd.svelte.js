import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import KbdArrowKeys from "./kbd-arrow-keys.svelte";
import KbdBasic from "./kbd-basic.svelte";
import KbdGroupExample from "./kbd-group-example.svelte";
import KbdInInputGroup from "./kbd-in-input-group.svelte";
import KbdInTooltip from "./kbd-in-tooltip.svelte";
import KbdModifierKeys from "./kbd-modifier-keys.svelte";
import KbdWithIconsAndText from "./kbd-with-icons-and-text.svelte";
import KbdWithIcons from "./kbd-with-icons.svelte";
import KbdWithSamp from "./kbd-with-samp.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Kbd($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			KbdBasic(node, {});

			var node_1 = $.sibling(node, 2);

			KbdModifierKeys(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			KbdGroupExample(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			KbdArrowKeys(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			KbdWithIcons(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			KbdWithIconsAndText(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			KbdInInputGroup(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			KbdInTooltip(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			KbdWithSamp(node_8, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}