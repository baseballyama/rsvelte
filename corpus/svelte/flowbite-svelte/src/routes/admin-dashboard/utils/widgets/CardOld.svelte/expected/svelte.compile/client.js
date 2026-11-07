import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Heading } from "flowbite-svelte";

var root = $.from_html(`<span class="text-base font-normal text-gray-500 dark:text-gray-300"> </span>`);
var root_1 = $.from_html(`<div class="mt-px mb-4 lg:mb-0"><!> <!></div> <!>`, 1);

export default function CardOld($$anchor, $$props) {
	Card($$anchor, {
		size: 'xl',
		get class() {
			return `max-w-none shadow-sm ${$$props.class ?? ''}`;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Heading(node, {
				tag: 'h3',
				class: 'mb-2 -ml-0.25 text-xl font-semibold dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, $$props.title));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					var span = root();
					var text_1 = $.only_child(span, true);

					$.template_effect(() => $.set_text(text_1, $$props.subtitle));
					$.append($$anchor, span);
				};

				$.if(node_1, ($$render) => {
					if ($$props.subtitle) $$render(consequent);
				});
			}

			$.reset(div);

			var node_2 = $.sibling(div, 2);

			$.snippet(node_2, () => $$props.children);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}