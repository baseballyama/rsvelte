import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsBasic from "./tabs-basic.svelte";
import TabsDisabled from "./tabs-disabled.svelte";
import TabsIconOnly from "./tabs-icon-only.svelte";
import TabsLineDisabled from "./tabs-line-disabled.svelte";
import TabsLineWithContent from "./tabs-line-with-content.svelte";
import TabsLine from "./tabs-line.svelte";
import TabsMultiple from "./tabs-multiple.svelte";
import TabsVariantsComparison from "./tabs-variants-comparison.svelte";
import TabsVertical from "./tabs-vertical.svelte";
import TabsWithContent from "./tabs-with-content.svelte";
import TabsWithDropdown from "./tabs-with-dropdown.svelte";
import TabsWithIcons from "./tabs-with-icons.svelte";
import TabsWithInputAndButton from "./tabs-with-input-and-button.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tabs($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TabsBasic(node, {});

			var node_1 = $.sibling(node, 2);

			TabsLine(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			TabsVariantsComparison(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			TabsDisabled(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			TabsWithIcons(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			TabsIconOnly(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			TabsMultiple(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			TabsWithContent(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			TabsLineWithContent(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			TabsLineDisabled(node_9, {});

			var node_10 = $.sibling(node_9, 2);

			TabsWithDropdown(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			TabsVertical(node_11, {});

			var node_12 = $.sibling(node_11, 2);

			TabsWithInputAndButton(node_12, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}