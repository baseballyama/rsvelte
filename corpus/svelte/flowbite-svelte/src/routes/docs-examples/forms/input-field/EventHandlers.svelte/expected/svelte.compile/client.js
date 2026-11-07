import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function EventHandlers($$anchor) {
	let value = $.state("Custom Event Handlers");
	var fragment = root();
	var node = $.first_child(fragment);

	P(node, {
		class: 'my-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(value)));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		oninput: (e) => console.log("Custom input:", e),
		onfocus: () => console.log("Input focused"),
		onblur: () => console.log("Input blurred"),
		onkeydown: (e) => {
			if (e.key === "Tab") {
				console.log("Tab pressed");
			}
		},

		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.append($$anchor, fragment);
}