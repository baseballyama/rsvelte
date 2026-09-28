import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckboxBasic from "./checkbox-basic.svelte";
import CheckboxDisabled from "./checkbox-disabled.svelte";
import CheckboxGroup from "./checkbox-group.svelte";
import CheckboxInTable from "./checkbox-in-table.svelte";
import CheckboxInvalid from "./checkbox-invalid.svelte";
import CheckboxWithDescription from "./checkbox-with-description.svelte";
import CheckboxWithTitle from "./checkbox-with-title.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Checkbox($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CheckboxBasic(node, {});

			var node_1 = $.sibling(node, 2);

			CheckboxWithDescription(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			CheckboxInvalid(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			CheckboxDisabled(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			CheckboxWithTitle(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			CheckboxInTable(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			CheckboxGroup(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}