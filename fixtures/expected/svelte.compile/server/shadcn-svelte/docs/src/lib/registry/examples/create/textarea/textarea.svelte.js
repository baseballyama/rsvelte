import * as $ from 'svelte/internal/server';
import TextareaBasic from "./textarea-basic.svelte";
import TextareaDisabled from "./textarea-disabled.svelte";
import TextareaInvalid from "./textarea-invalid.svelte";
import TextareaWithDescription from "./textarea-with-description.svelte";
import TextareaWithLabel from "./textarea-with-label.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Textarea($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			TextareaBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			TextareaInvalid($$renderer, {});
			$$renderer.push(`<!----> `);
			TextareaWithLabel($$renderer, {});
			$$renderer.push(`<!----> `);
			TextareaWithDescription($$renderer, {});
			$$renderer.push(`<!----> `);
			TextareaDisabled($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}