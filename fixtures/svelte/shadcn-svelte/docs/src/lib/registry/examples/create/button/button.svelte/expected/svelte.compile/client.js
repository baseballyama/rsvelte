import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ButtonExamples from "./button-examples.svelte";
import ButtonIconLeft from "./button-icon-left.svelte";
import ButtonIconOnly from "./button-icon-only.svelte";
import ButtonIconRight from "./button-icon-right.svelte";
import ButtonInvalidStates from "./button-invalid-states.svelte";
import ButtonVariantsAndSizes from "./button-variants-and-sizes.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Button($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'lg:grid-cols-1 2xl:grid-cols-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ButtonVariantsAndSizes(node, {});

			var node_1 = $.sibling(node, 2);

			ButtonIconRight(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ButtonIconLeft(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ButtonIconOnly(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ButtonInvalidStates(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ButtonExamples(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}