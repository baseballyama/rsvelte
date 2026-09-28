import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyInput from "carbon-components-svelte/CopyInput/CopyInput.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function CopyInput_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			CopyInput($$anchor, {
				labelText: 'Fluid form API token',
				value: 'sk-1234567890abcdef'
			});
		},
		$$slots: { default: true }
	});
}