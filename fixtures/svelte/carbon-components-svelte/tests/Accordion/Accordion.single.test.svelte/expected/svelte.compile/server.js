import * as $ from 'svelte/internal/server';
import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";

export default function Accordion_single_test($$renderer) {
	const items = [
		{
			title: "Natural Language Classifier",
			description: "Natural Language Classifier uses advanced natural language processing and machine learning techniques to create custom classification models."
		},

		{
			title: "Natural Language Understanding",
			description: "Analyze text to extract meta-data from content such as concepts, entities, emotion, relations, sentiment and more."
		},

		{
			title: "Language Translator",
			description: "Translate text, documents, and websites from one language to another."
		}
	];

	Accordion($$renderer, {
		type: 'single',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				AccordionItem($$renderer, {
					title: item.title,
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
}