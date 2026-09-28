import * as $ from 'svelte/internal/server';
import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";

export default function Accordion_disabled_test($$renderer) {
	Accordion($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			AccordionItem($$renderer, {
				title: 'Natural Language Classifier',
				children: ($$renderer) => {
					$$renderer.push(`<p>Natural Language Classifier uses advanced natural language processing and
      machine learning techniques to create custom classification models. Users
      train their data and the service predicts the appropriate category for the
      inputted text.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			AccordionItem($$renderer, {
				title: 'Natural Language Understanding',
				children: ($$renderer) => {
					$$renderer.push(`<p>Analyze text to extract meta-data from content such as concepts, entities,
      emotion, relations, sentiment and more.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			AccordionItem($$renderer, {
				title: 'Language Translator',
				children: ($$renderer) => {
					$$renderer.push(`<p>Translate text, documents, and websites from one language to another.
      Create industry or region-specific translations via the service's
      customization capability.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}