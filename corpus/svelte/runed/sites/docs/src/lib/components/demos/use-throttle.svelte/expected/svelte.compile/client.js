import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useThrottle } from "runed";
import { Label, Input, DemoContainer } from "@svecodocs/kit";

var root = $.from_html(`You searched for: <b> </b>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-1.5"><!> <!></div> <div class="flex flex-col gap-1.5"><!> <!></div> <p><!></p>`, 1);
var root_2 = $.from_html(`<!> <div class="h-1 w-screen"></div>`, 1);

export default function Use_throttle($$anchor, $$props) {
	$.push($$props, true);

	let search = $.state("");
	let throttledSearch = $.state("");
	let durationMs = $.state(1000);
	const setThrottledSearch = useThrottle(() => $.set(throttledSearch, $.get(search), true), () => $.get(durationMs));
	var fragment = root_2();
	var node = $.first_child(fragment);

	DemoContainer(node, {
		class: 'flex flex-col gap-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			Label(node_1, {
				for: 'duration',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Throttle duration (ms)');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, {
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
			var node_3 = $.child(div_1);

			Label(node_3, {
				for: 'search',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Search');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);
			var bind_get = () => $.get(search);

			var bind_set = (v) => {
				$.set(search, v, true);
				setThrottledSearch();
			};

			Input(node_4, {
				get value() {
					return bind_get();
				},

				set value($$value) {
					bind_set($$value);
				},
				placeholder: 'Search the best utilities for Svelte 5'
			});

			$.reset(div_1);

			var p = $.sibling(div_1, 2);
			var node_5 = $.child(p);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var b = $.sibling($.first_child(fragment_2));
					var text_2 = $.only_child(b, true);

					$.template_effect(() => $.set_text(text_2, $.get(throttledSearch)));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text_3 = $.text('Search for something above!');

					$.append($$anchor, text_3);
				};

				$.if(node_5, ($$render) => {
					if ($.get(throttledSearch)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(p);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.append($$anchor, fragment);
	$.pop();
}