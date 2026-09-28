import * as $ from 'svelte/internal/server';
import InputGroupBasic from "./input-group-basic.svelte";
import InputGroupInCard from "./input-group-in-card.svelte";
import InputGroupTextareaExamples from "./input-group-textarea-examples.svelte";
import InputGroupWithAddons from "./input-group-with-addons.svelte";
import InputGroupWithButtons from "./input-group-with-buttons.svelte";
import InputGroupWithKbd from "./input-group-with-kbd.svelte";
import InputGroupWithTooltip from "./input-group-with-tooltip.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Input_group($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'min-w-0',
		children: ($$renderer) => {
			InputGroupBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupWithAddons($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupWithButtons($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupWithTooltip($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupWithKbd($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupInCard($$renderer, {});
			$$renderer.push(`<!----> `);
			InputGroupTextareaExamples($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}