import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Accordion from "carbon-components-svelte/Accordion/Accordion.svelte";
import AccordionItem from "carbon-components-svelte/Accordion/AccordionItem.svelte";

var root = $.from_html(`<p>Natural Language Classifier uses advanced natural language processing and
      machine learning techniques to create custom classification models. Users
      train their data and the service predicts the appropriate category for the
      inputted text.</p>`);

var root_1 = $.from_html(`<p>Analyze text to extract meta-data from content such as concepts, entities,
      emotion, relations, sentiment and more.</p>`);

var root_2 = $.from_html(`<p>Translate text, documents, and websites from one language to another.
      Create industry or region-specific translations via the service's
      customization capability.</p>`);

var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Accordion_disabled_test($$anchor) {
	Accordion($$anchor, {
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			AccordionItem(node, {
				title: 'Natural Language Classifier',
				children: ($$anchor, $$slotProps) => {
					var p = root();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			AccordionItem(node_1, {
				title: 'Natural Language Understanding',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			AccordionItem(node_2, {
				title: 'Language Translator',
				children: ($$anchor, $$slotProps) => {
					var p_2 = root_2();

					$.append($$anchor, p_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}