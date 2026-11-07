import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AlertDialogBasic from "./alert-dialog-basic.svelte";
import AlertDialogDestructive from "./alert-dialog-destructive.svelte";
import AlertDialogInDialog from "./alert-dialog-in-dialog.svelte";
import AlertDialogSmallWithMedia from "./alert-dialog-small-with-media.svelte";
import AlertDialogSmall from "./alert-dialog-small.svelte";
import AlertDialogWithMedia from "./alert-dialog-with-media.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Alert_dialog($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AlertDialogBasic(node, {});

			var node_1 = $.sibling(node, 2);

			AlertDialogSmall(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			AlertDialogWithMedia(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			AlertDialogSmallWithMedia(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			AlertDialogDestructive(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			AlertDialogInDialog(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}