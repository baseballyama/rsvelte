import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboboxBasic from "./combobox-basic.svelte";
import ComboboxDisabledItems from "./combobox-disabled-items.svelte";
import ComboboxDisabled from "./combobox-disabled.svelte";
import ComboboxInDialog from "./combobox-in-dialog.svelte";
import ComboboxInPopup from "./combobox-in-popup.svelte";
import ComboboxInvalid from "./combobox-invalid.svelte";
import ComboboxLargeList from "./combobox-large-list.svelte";
import ComboboxMultipleInvalid from "./combobox-multiple-invalid.svelte";
import ComboboxMultiple from "./combobox-multiple.svelte";
import ComboboxWithCustomItems from "./combobox-with-custom-items.svelte";
import ComboboxWithForm from "./combobox-with-form.svelte";
import ComboboxWithGroupsAndSeparator from "./combobox-with-groups-and-separator.svelte";
import ComboboxWithGroups from "./combobox-with-groups.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Combobox($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ComboboxBasic(node, {});

			var node_1 = $.sibling(node, 2);

			ComboboxDisabled(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ComboboxInvalid(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ComboboxWithGroups(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ComboboxWithGroupsAndSeparator(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ComboboxLargeList(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			ComboboxInPopup(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ComboboxWithForm(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ComboboxMultiple(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ComboboxMultipleInvalid(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			ComboboxWithCustomItems(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			ComboboxInDialog(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			ComboboxDisabledItems(node_12, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}