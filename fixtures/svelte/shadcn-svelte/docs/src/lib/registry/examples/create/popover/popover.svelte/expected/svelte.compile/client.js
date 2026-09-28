import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PopoverAlignments from "./popover-alignments.svelte";
import PopoverBasic from "./popover-basic.svelte";
import PopoverInDialog from "./popover-in-dialog.svelte";
import PopoverWithForm from "./popover-with-form.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Popover($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			PopoverBasic(node, {});

			var node_1 = $.sibling(node, 2);

			PopoverWithForm(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			PopoverAlignments(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			PopoverInDialog(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}