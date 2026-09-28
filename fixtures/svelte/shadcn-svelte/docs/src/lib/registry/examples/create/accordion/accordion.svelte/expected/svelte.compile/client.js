import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AccordionBasic from "./accordion-basic.svelte";
import AccordionInCard from "./accordion-in-card.svelte";
import AccordionMultiple from "./accordion-multiple.svelte";
import AccordionWithBorders from "./accordion-with-borders.svelte";
import AccordionWithDisabled from "./accordion-with-disabled.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Accordion($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'w-full max-w-4xl lg:grid-cols-1 2xl:max-w-4xl 2xl:grid-cols-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AccordionBasic(node, {});

			var node_1 = $.sibling(node, 2);

			AccordionMultiple(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			AccordionWithBorders(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			AccordionInCard(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			AccordionWithDisabled(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}