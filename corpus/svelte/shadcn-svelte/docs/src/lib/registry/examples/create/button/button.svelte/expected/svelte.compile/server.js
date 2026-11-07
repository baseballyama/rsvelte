import * as $ from 'svelte/internal/server';
import ButtonExamples from "./button-examples.svelte";
import ButtonIconLeft from "./button-icon-left.svelte";
import ButtonIconOnly from "./button-icon-only.svelte";
import ButtonIconRight from "./button-icon-right.svelte";
import ButtonInvalidStates from "./button-invalid-states.svelte";
import ButtonVariantsAndSizes from "./button-variants-and-sizes.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Button($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'lg:grid-cols-1 2xl:grid-cols-1',
		children: ($$renderer) => {
			ButtonVariantsAndSizes($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonIconRight($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonIconLeft($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonIconOnly($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonInvalidStates($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonExamples($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}