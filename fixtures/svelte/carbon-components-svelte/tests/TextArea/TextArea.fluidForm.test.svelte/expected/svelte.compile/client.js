import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import TextArea from "carbon-components-svelte/TextArea/TextArea.svelte";

export default function TextArea_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			TextArea($$anchor, {
				labelText: 'Fluid form description',
				placeholder: 'Enter a description...'
			});
		},
		$$slots: { default: true }
	});
}