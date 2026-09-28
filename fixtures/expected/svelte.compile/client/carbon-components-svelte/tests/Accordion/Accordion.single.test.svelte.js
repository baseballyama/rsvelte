import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";

var root = $.from_html(`<p> </p>`);

export default function Accordion_single_test($$anchor) {
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

	Accordion($$anchor, {
		type: 'single',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => items, $.index, ($$anchor, item) => {
				AccordionItem($$anchor, {
					get title() {
						return $.get(item).title;
					},

					children: ($$anchor, $$slotProps) => {
						var p = root();
						var text = $.only_child(p, true);

						$.template_effect(() => $.set_text(text, $.get(item).description));
						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}