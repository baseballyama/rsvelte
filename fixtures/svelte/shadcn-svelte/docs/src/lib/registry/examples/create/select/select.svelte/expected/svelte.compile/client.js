import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectBasic from "./select-basic.svelte";
import SelectDisabled from "./select-disabled.svelte";
import SelectInDialog from "./select-in-dialog.svelte";
import SelectInline from "./select-inline.svelte";
import SelectInvalid from "./select-invalid.svelte";
import SelectItemAligned from "./select-item-aligned.svelte";
import SelectLargeList from "./select-large-list.svelte";
import SelectPlan from "./select-plan.svelte";
import SelectSizes from "./select-sizes.svelte";
import SelectWithButton from "./select-with-button.svelte";
import SelectWithField from "./select-with-field.svelte";
import SelectWithGroups from "./select-with-groups.svelte";
import SelectWithIcons from "./select-with-icons.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Select($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SelectBasic(node, {});

			var node_1 = $.sibling(node, 2);

			SelectWithIcons(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SelectWithGroups(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			SelectLargeList(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			SelectSizes(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			SelectPlan(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			SelectWithButton(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			SelectItemAligned(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			SelectWithField(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			SelectInvalid(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			SelectInline(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			SelectDisabled(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			SelectInDialog(node_12, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}