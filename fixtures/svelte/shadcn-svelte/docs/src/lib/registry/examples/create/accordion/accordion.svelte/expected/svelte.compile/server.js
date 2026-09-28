import * as $ from 'svelte/internal/server';
import AccordionBasic from "./accordion-basic.svelte";
import AccordionInCard from "./accordion-in-card.svelte";
import AccordionMultiple from "./accordion-multiple.svelte";
import AccordionWithBorders from "./accordion-with-borders.svelte";
import AccordionWithDisabled from "./accordion-with-disabled.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Accordion($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'w-full max-w-4xl lg:grid-cols-1 2xl:max-w-4xl 2xl:grid-cols-1',
		children: ($$renderer) => {
			AccordionBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			AccordionMultiple($$renderer, {});
			$$renderer.push(`<!----> `);
			AccordionWithBorders($$renderer, {});
			$$renderer.push(`<!----> `);
			AccordionInCard($$renderer, {});
			$$renderer.push(`<!----> `);
			AccordionWithDisabled($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}