import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SheetNoCloseButton from "./sheet-no-close-button.svelte";
import SheetWithForm from "./sheet-with-form.svelte";
import SheetWithSides from "./sheet-with-sides.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Sheet($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SheetWithForm(node, {});

			var node_1 = $.sibling(node, 2);

			SheetNoCloseButton(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SheetWithSides(node_2, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}