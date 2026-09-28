import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToggleGroupBasic from "./toggle-group-basic.svelte";
import ToggleGroupDateRange from "./toggle-group-date-range.svelte";
import ToggleGroupFilter from "./toggle-group-filter.svelte";
import ToggleGroupFontWeightSelector from "./toggle-group-font-weight-selector.svelte";
import ToggleGroupOutlineWithIcons from "./toggle-group-outline-with-icons.svelte";
import ToggleGroupOutline from "./toggle-group-outline.svelte";
import ToggleGroupSizes from "./toggle-group-sizes.svelte";
import ToggleGroupSort from "./toggle-group-sort.svelte";
import ToggleGroupSpacing from "./toggle-group-spacing.svelte";
import ToggleGroupVerticalOutlineWithIcons from "./toggle-group-vertical-outline-with-icons.svelte";
import ToggleGroupVerticalOutline from "./toggle-group-vertical-outline.svelte";
import ToggleGroupVerticalWithSpacing from "./toggle-group-vertical-with-spacing.svelte";
import ToggleGroupVertical from "./toggle-group-vertical.svelte";
import ToggleGroupWithIcons from "./toggle-group-with-icons.svelte";
import ToggleGroupWithInputAndSelect from "./toggle-group-with-input-and-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Toggle_group($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ToggleGroupBasic(node, {});

			var node_1 = $.sibling(node, 2);

			ToggleGroupOutline(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ToggleGroupOutlineWithIcons(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ToggleGroupSizes(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ToggleGroupSpacing(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ToggleGroupWithIcons(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			ToggleGroupFilter(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ToggleGroupDateRange(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ToggleGroupSort(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			ToggleGroupWithInputAndSelect(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			ToggleGroupVertical(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			ToggleGroupVerticalOutline(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			ToggleGroupVerticalOutlineWithIcons(node_12, {});

			var node_13 = $.sibling(node_12, 2);

			ToggleGroupVerticalWithSpacing(node_13, {});

			var node_14 = $.sibling(node_13, 2);

			ToggleGroupFontWeightSelector(node_14, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}