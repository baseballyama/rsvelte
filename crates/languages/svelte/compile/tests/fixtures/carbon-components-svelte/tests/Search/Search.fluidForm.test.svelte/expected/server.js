import * as $ from 'svelte/internal/server';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import Search from "carbon-components-svelte/Search/Search.svelte";

export default function Search_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			Search($$renderer, { labelText: 'Fluid form search', placeholder: 'Search' });
		},
		$$slots: { default: true }
	});
}