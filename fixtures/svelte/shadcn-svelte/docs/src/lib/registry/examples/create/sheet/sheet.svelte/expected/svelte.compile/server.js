import * as $ from 'svelte/internal/server';
import SheetNoCloseButton from "./sheet-no-close-button.svelte";
import SheetWithForm from "./sheet-with-form.svelte";
import SheetWithSides from "./sheet-with-sides.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Sheet($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SheetWithForm($$renderer, {});
			$$renderer.push(`<!----> `);
			SheetNoCloseButton($$renderer, {});
			$$renderer.push(`<!----> `);
			SheetWithSides($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}