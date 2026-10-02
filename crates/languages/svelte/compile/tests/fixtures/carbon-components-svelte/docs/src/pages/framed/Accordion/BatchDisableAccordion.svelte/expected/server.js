import * as $ from 'svelte/internal/server';
import { Accordion, AccordionItem, Button, ButtonSet } from "carbon-components-svelte";

export default function BatchDisableAccordion($$renderer) {
	let disabled = false;

	const items = [
		{
			title: "Natural Language Classifier",
			description: "Natural Language Classifier uses advanced natural language processing and machine learning techniques to create custom classification models. Users train their data and the service predicts the appropriate category for the inputted text."
		},

		{
			title: "Natural Language Understanding",
			description: "Analyze text to extract meta-data from content such as concepts, entities, emotion, relations, sentiment and more."
		},

		{
			title: "Language Translator",
			description: "Translate text, documents, and websites from one language to another. Create industry or region-specific translations via the service's customization capability."
		}
	];

	let open = false;

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				size: 'field',
				disabled,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(open ? "Collapse" : "Expand")}
    all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'ghost',
				size: 'field',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(disabled ? "Enable" : "Disable")}
    all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Accordion($$renderer, {
		disabled,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				AccordionItem($$renderer, {
					title: item.title,
					open,
					children: ($$renderer) => {
						$$renderer.push(`<p>${$.escape(item.description)}</p>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}