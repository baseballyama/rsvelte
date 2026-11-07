import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion, AccordionItem, Button, ButtonSet } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p> </p>`);

export default function BatchDisableAccordion($$anchor) {
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
	var fragment = root();
	var node = $.first_child(fragment);

	ButtonSet(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				size: 'field',
				get disabled() {
					return disabled;
				},
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

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				kind: 'ghost',
				size: 'field',
				$$events: {
					click: () => {
						disabled = !disabled;

						if (disabled) {
							open = false;
						}
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, `${disabled ? "Enable" : "Disable"}
    all`));

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Accordion(node_3, {
		get disabled() {
			return disabled;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_4 = $.first_child(fragment_4);

			$.each(node_4, 17, () => items, $.index, ($$anchor, item) => {
				AccordionItem($$anchor, {
					get title() {
						return $.get(item).title;
					},

					get open() {
						return open;
					},

					children: ($$anchor, $$slotProps) => {
						var p = root_1();
						var text_2 = $.only_child(p, true);

						$.template_effect(() => $.set_text(text_2, $.get(item).description));
						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}