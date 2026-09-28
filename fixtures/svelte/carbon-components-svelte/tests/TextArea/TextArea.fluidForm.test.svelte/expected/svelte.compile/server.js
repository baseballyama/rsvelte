import * as $ from 'svelte/internal/server';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import TextArea from "carbon-components-svelte/TextArea/TextArea.svelte";

export default function TextArea_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			TextArea($$renderer, {
				labelText: 'Fluid form description',
				placeholder: 'Enter a description...'
			});
		},
		$$slots: { default: true }
	});
}