import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TransitionNone($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Accordion(node, {
		transitionType: 'none',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text = $.text('My Header 1');

					$.append($$anchor, text);
				};

				AccordionItem(node_1, {
					header,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Content A');

						$.append($$anchor, text_1);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_2 = $.text('My Header 2');

					$.append($$anchor, text_2);
				};

				AccordionItem(node_2, {
					header,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Content B');

						$.append($$anchor, text_3);
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Accordion(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_4 = $.text('transitionType: "none"');

					$.append($$anchor, text_4);
				};

				AccordionItem(node_4, {
					transitionType: 'none',
					header,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Content C');

						$.append($$anchor, text_5);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_6 = $.text('transitionType: default');

					$.append($$anchor, text_6);
				};

				AccordionItem(node_5, {
					header,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_7 = $.text('Content D');

						$.append($$anchor, text_7);
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}