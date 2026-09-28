import * as $ from 'svelte/internal/server';
import PopoverAlignments from "./popover-alignments.svelte";
import PopoverBasic from "./popover-basic.svelte";
import PopoverInDialog from "./popover-in-dialog.svelte";
import PopoverWithForm from "./popover-with-form.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Popover($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			PopoverBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			PopoverWithForm($$renderer, {});
			$$renderer.push(`<!----> `);
			PopoverAlignments($$renderer, {});
			$$renderer.push(`<!----> `);
			PopoverInDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}