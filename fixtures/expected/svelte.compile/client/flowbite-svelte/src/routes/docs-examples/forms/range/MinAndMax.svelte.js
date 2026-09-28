import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Range, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <p> </p>`, 1);

export default function MinAndMax($$anchor) {
	let minmaxValue = 5;
	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Min-max range');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Range(node_1, {
		id: 'range-minmax',
		min: '0',
		max: '10',
		get value() {
			return minmaxValue;
		},

		set value($$value) {
			minmaxValue = $$value;
		}
	});

	var p = $.sibling(node_1, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => $.set_text(text_1, `Value: ${minmaxValue ?? ''}`));
	$.append($$anchor, fragment);
}