import * as $ from 'svelte/internal/server';
import RadioGroupBasic from "./radio-group-basic.svelte";
import RadioGroupDisabled from "./radio-group-disabled.svelte";
import RadioGroupGrid from "./radio-group-grid.svelte";
import RadioGroupInvalid from "./radio-group-invalid.svelte";
import RadioGroupWithDescriptions from "./radio-group-with-descriptions.svelte";
import RadioGroupWithFieldSet from "./radio-group-with-field-set.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Radio_group($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			RadioGroupBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			RadioGroupWithDescriptions($$renderer, {});
			$$renderer.push(`<!----> `);
			RadioGroupWithFieldSet($$renderer, {});
			$$renderer.push(`<!----> `);
			RadioGroupGrid($$renderer, {});
			$$renderer.push(`<!----> `);
			RadioGroupDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			RadioGroupInvalid($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}