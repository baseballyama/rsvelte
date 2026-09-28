import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LabelDisabled from "./label-disabled.svelte";
import LabelWithCheckbox from "./label-with-checkbox.svelte";
import LabelWithInput from "./label-with-input.svelte";
import LabelWithTextarea from "./label-with-textarea.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Label($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			LabelWithCheckbox(node, {});

			var node_1 = $.sibling(node, 2);

			LabelWithInput(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			LabelDisabled(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			LabelWithTextarea(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}