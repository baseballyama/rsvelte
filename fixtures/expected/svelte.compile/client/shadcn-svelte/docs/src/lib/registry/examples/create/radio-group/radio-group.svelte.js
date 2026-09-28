import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RadioGroupBasic from "./radio-group-basic.svelte";
import RadioGroupDisabled from "./radio-group-disabled.svelte";
import RadioGroupGrid from "./radio-group-grid.svelte";
import RadioGroupInvalid from "./radio-group-invalid.svelte";
import RadioGroupWithDescriptions from "./radio-group-with-descriptions.svelte";
import RadioGroupWithFieldSet from "./radio-group-with-field-set.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Radio_group($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			RadioGroupBasic(node, {});

			var node_1 = $.sibling(node, 2);

			RadioGroupWithDescriptions(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			RadioGroupWithFieldSet(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			RadioGroupGrid(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			RadioGroupDisabled(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			RadioGroupInvalid(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}