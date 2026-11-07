import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SwitchBasic from "./switch-basic.svelte";
import SwitchDisabled from "./switch-disabled.svelte";
import SwitchSizes from "./switch-sizes.svelte";
import SwitchWithDescription from "./switch-with-description.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Switch($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SwitchBasic(node, {});

			var node_1 = $.sibling(node, 2);

			SwitchWithDescription(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SwitchDisabled(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			SwitchSizes(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}