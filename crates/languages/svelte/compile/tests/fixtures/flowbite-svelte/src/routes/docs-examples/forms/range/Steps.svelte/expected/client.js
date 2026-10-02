import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Range, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <p> </p>`, 1);

export default function Steps($$anchor) {
	let stepValue = 2.5;
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Range steps');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Range(node_1, {
		id: 'range-steps',
		min: '0',
		max: '5',
		step: '0.5',
		get value() {
			return stepValue;
		},

		set value($$value) {
			stepValue = $$value;
		}
	});

	var p = $.sibling(node_1, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => $.set_text(text_1, `Value: ${stepValue ?? ''}`));
	$.append($$anchor, fragment);
}