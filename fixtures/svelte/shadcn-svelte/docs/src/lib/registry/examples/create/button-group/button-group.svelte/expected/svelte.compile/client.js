import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonGroupBasic from "./button-group-basic.svelte";
import ButtonGroupNavigation from "./button-group-navigation.svelte";
import ButtonGroupNested from "./button-group-nested.svelte";
import ButtonGroupPaginationSplit from "./button-group-pagination-split.svelte";
import ButtonGroupPagination from "./button-group-pagination.svelte";
import ButtonGroupTextAlignment from "./button-group-text-alignment.svelte";
import ButtonGroupVerticalNested from "./button-group-vertical-nested.svelte";
import ButtonGroupVertical from "./button-group-vertical.svelte";
import ButtonGroupWithDropdown from "./button-group-with-dropdown.svelte";
import ButtonGroupWithFields from "./button-group-with-fields.svelte";
import ButtonGroupWithIcons from "./button-group-with-icons.svelte";
import ButtonGroupWithInputGroup from "./button-group-with-input-group.svelte";
import ButtonGroupWithInput from "./button-group-with-input.svelte";
import ButtonGroupWithLike from "./button-group-with-like.svelte";
import ButtonGroupWithSelectAndInput from "./button-group-with-select-and-input.svelte";
import ButtonGroupWithSelect from "./button-group-with-select.svelte";
import ButtonGroupWithText from "./button-group-with-text.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Button_group($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ButtonGroupBasic(node, {});

			var node_1 = $.sibling(node, 2);

			ButtonGroupWithInput(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ButtonGroupWithText(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ButtonGroupWithDropdown(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ButtonGroupWithSelect(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ButtonGroupWithIcons(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			ButtonGroupWithInputGroup(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ButtonGroupWithFields(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ButtonGroupWithLike(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ButtonGroupWithSelectAndInput(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			ButtonGroupNested(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			ButtonGroupPagination(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			ButtonGroupPaginationSplit(node_12, {});

			var node_13 = $.sibling(node_12, 2);

			ButtonGroupNavigation(node_13, {});

			var node_14 = $.sibling(node_13, 2);

			ButtonGroupTextAlignment(node_14, {});

			var node_15 = $.sibling(node_14, 2);

			ButtonGroupVertical(node_15, {});

			var node_16 = $.sibling(node_15, 2);

			ButtonGroupVerticalNested(node_16, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}