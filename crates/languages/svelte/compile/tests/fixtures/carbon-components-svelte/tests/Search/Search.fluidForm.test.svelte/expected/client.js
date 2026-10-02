import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import Search from "carbon-components-svelte/Search/Search.svelte";

export default function Search_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Search($$anchor, { labelText: 'Fluid form search', placeholder: 'Search' });
		},
		$$slots: { default: true }
	});
}