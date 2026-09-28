import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InputGroupBasic from "./input-group-basic.svelte";
import InputGroupInCard from "./input-group-in-card.svelte";
import InputGroupTextareaExamples from "./input-group-textarea-examples.svelte";
import InputGroupWithAddons from "./input-group-with-addons.svelte";
import InputGroupWithButtons from "./input-group-with-buttons.svelte";
import InputGroupWithKbd from "./input-group-with-kbd.svelte";
import InputGroupWithTooltip from "./input-group-with-tooltip.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_group($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'min-w-0',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			InputGroupBasic(node, {});

			var node_1 = $.sibling(node, 2);

			InputGroupWithAddons(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			InputGroupWithButtons(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			InputGroupWithTooltip(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			InputGroupWithKbd(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			InputGroupInCard(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			InputGroupTextareaExamples(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}