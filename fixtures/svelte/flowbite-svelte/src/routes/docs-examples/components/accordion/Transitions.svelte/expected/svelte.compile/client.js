import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AccordionItem, Accordion } from "flowbite-svelte";
import { blur, fade } from "svelte/transition";

var root = $.from_html(`<p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Transitions($$anchor) {
	Accordion($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			{
				const header = ($$anchor) => {
					$.next();

					var text = $.text('Slide duration:1000');

					$.append($$anchor, text);
				};

				AccordionItem(node, {
					transitionParams: { duration: 1000 },
					header,
					children: ($$anchor, $$slotProps) => {
						var p = root();

						$.append($$anchor, p);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_1 = $.sibling(node, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_1 = $.text('Blur duration:300');

					$.append($$anchor, text_1);
				};

				AccordionItem(node_1, {
					get transitionType() {
						return blur;
					},
					transitionParams: { duration: 300 },
					header,
					children: ($$anchor, $$slotProps) => {
						var p_1 = root();

						$.append($$anchor, p_1);
					},
					$$slots: { header: true, default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const header = ($$anchor) => {
					$.next();

					var text_2 = $.text('Fade duration:300');

					$.append($$anchor, text_2);
				};

				AccordionItem(node_2, {
					get transitionType() {
						return fade;
					},
					transitionParams: { duration: 300 },
					header,
					children: ($$anchor, $$slotProps) => {
						var p_2 = root();

						$.append($$anchor, p_2);
					},
					$$slots: { header: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}