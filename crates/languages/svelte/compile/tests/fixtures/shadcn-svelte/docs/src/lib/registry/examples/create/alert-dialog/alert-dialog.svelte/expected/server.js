import * as $ from 'svelte/internal/server';
import AlertDialogBasic from "./alert-dialog-basic.svelte";
import AlertDialogDestructive from "./alert-dialog-destructive.svelte";
import AlertDialogInDialog from "./alert-dialog-in-dialog.svelte";
import AlertDialogSmallWithMedia from "./alert-dialog-small-with-media.svelte";
import AlertDialogSmall from "./alert-dialog-small.svelte";
import AlertDialogWithMedia from "./alert-dialog-with-media.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Alert_dialog($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			AlertDialogBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertDialogSmall($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertDialogWithMedia($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertDialogSmallWithMedia($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertDialogDestructive($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertDialogInDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}