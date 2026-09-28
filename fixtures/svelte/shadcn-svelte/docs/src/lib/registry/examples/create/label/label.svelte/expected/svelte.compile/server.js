import * as $ from 'svelte/internal/server';
import LabelDisabled from "./label-disabled.svelte";
import LabelWithCheckbox from "./label-with-checkbox.svelte";
import LabelWithInput from "./label-with-input.svelte";
import LabelWithTextarea from "./label-with-textarea.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Label($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			LabelWithCheckbox($$renderer, {});
			$$renderer.push(`<!----> `);
			LabelWithInput($$renderer, {});
			$$renderer.push(`<!----> `);
			LabelDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			LabelWithTextarea($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}