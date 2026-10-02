import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";
import Button from "carbon-components-svelte/Button/Button.svelte";

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Accordion_programmatic_test($$anchor) {
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
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		kind: 'ghost',
		size: 'field',
		$$events: { click: () => open = !open },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `${open ? "Collapse" : "Expand"}
  all`));

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Accordion(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 17, () => items, $.index, ($$anchor, item) => {
				AccordionItem($$anchor, {
					get title() {
						return $.get(item).title;
					},

					get open() {
						return open;
					},

					children: ($$anchor, $$slotProps) => {
						var p = root();
						var text_1 = $.only_child(p, true);

						$.template_effect(() => $.set_text(text_1, $.get(item).description));
						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}