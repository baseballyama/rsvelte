import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Throttled } from "runed";
import { Label, Input, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`You searched for: <b> </b>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-1.5"><!> <!></div> <div class="flex flex-col gap-1.5"><!> <!></div> <p><!></p>`, 1);

export default function Throttled_1($$anchor, $$props) {
	$.push($$props, true);

	let search = $.state("");
	let durationMs = $.state(1000);
	const throttledSearch = new Throttled(() => $.get(search), () => $.get(durationMs));

	DemoContainer($$anchor, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Label(node, {
				for: 'duration',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Throttle duration (ms)');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, {
				id: 'duration',
				type: 'number',
				get value() {
					return $.get(durationMs);
				},

				set value($$value) {
					$.set(durationMs, $$value, true);
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_2 = $.child(div_1);

			Label(node_2, {
				for: 'search',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Search');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				placeholder: 'Search the best utilities for Svelte 5',
				get value() {
					return $.get(search);
				},

				set value($$value) {
					$.set(search, $$value, true);
				}
			});

			$.reset(div_1);

			var p = $.sibling(div_1, 2);
			var node_4 = $.child(p);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var b = $.sibling($.first_child(fragment_2));
					var text_2 = $.only_child(b, true);

					$.template_effect(() => $.set_text(text_2, throttledSearch.current));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text_3 = $.text('Search for something above!');

					$.append($$anchor, text_3);
				};

				$.if(node_4, ($$render) => {
					if (throttledSearch.current) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(p);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}