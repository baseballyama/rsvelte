import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToggleBasic from "./toggle-basic.svelte";
import ToggleDisabled from "./toggle-disabled.svelte";
import ToggleOutline from "./toggle-outline.svelte";
import ToggleSizes from "./toggle-sizes.svelte";
import ToggleWithButtonIconText from "./toggle-with-button-icon-text.svelte";
import ToggleWithButtonIcon from "./toggle-with-button-icon.svelte";
import ToggleWithButtonText from "./toggle-with-button-text.svelte";
import ToggleWithIcon from "./toggle-with-icon.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Toggle($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ToggleBasic(node, {});

			var node_1 = $.sibling(node, 2);

			ToggleOutline(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ToggleSizes(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ToggleWithButtonText(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ToggleWithButtonIcon(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ToggleWithButtonIconText(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			ToggleDisabled(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ToggleWithIcon(node_7, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}