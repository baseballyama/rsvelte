import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SpinnerBasic from "./spinner-basic.svelte";
import SpinnerInBadges from "./spinner-in-badges.svelte";
import SpinnerInButtons from "./spinner-in-buttons.svelte";
import SpinnerInEmpty from "./spinner-in-empty.svelte";
import SpinnerInInputGroup from "./spinner-in-input-group.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Spinner($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SpinnerBasic(node, {});

			var node_1 = $.sibling(node, 2);

			SpinnerInButtons(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SpinnerInBadges(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			SpinnerInInputGroup(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			SpinnerInEmpty(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}