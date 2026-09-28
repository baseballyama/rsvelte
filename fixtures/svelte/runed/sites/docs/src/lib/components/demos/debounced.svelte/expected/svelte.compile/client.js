import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Debounced } from "runed";
import { DemoContainer, Input } from "@svecodocs/kit";

var root = $.from_html(`You searched for: <b> </b>`, 1);
var root_1 = $.from_html(`<!> <p><!></p>`, 1);

export default function Debounced_1($$anchor, $$props) {
	$.push($$props, true);

	let search = $.state("");
	const debounced = new Debounced(() => $.get(search), 500);

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Input(node, {
				placeholder: 'Search the best utilities for Svelte 5',
				get value() {
					return $.get(search);
				},

				set value($$value) {
					$.set(search, $$value, true);
				}
			});

			var p = $.sibling(node, 2);
			var node_1 = $.child(p);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var b = $.sibling($.first_child(fragment_2));
					var text = $.only_child(b, true);

					$.template_effect(() => $.set_text(text, debounced.current));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text_1 = $.text('Search for something above!');

					$.append($$anchor, text_1);
				};

				$.if(node_1, ($$render) => {
					if (debounced.current) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(p);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}