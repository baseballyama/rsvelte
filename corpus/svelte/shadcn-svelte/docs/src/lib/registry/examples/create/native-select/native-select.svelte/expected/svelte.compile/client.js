import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NativeSelectBasic from "./native-select-basic.svelte";
import NativeSelectDisabled from "./native-select-disabled.svelte";
import NativeSelectInvalid from "./native-select-invalid.svelte";
import NativeSelectSizes from "./native-select-sizes.svelte";
import NativeSelectWithField from "./native-select-with-field.svelte";
import NativeSelectWithGroups from "./native-select-with-groups.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Native_select($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			NativeSelectBasic(node, {});

			var node_1 = $.sibling(node, 2);

			NativeSelectWithGroups(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			NativeSelectSizes(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			NativeSelectWithField(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			NativeSelectDisabled(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			NativeSelectInvalid(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}