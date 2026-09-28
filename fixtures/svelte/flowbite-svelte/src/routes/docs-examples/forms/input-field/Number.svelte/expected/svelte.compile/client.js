import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label } from "flowbite-svelte";

var root = $.from_html(`<span>Your Age</span> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="dark:text-white"><p> </p> <p> </p></div>`, 1);

export default function Number($$anchor) {
	let value = $.state(5);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Label(node, {
		class: 'mb-4 flex flex-col gap-2',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			Input(node_1, {
				type: 'number',
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var p = $.child(div);
	var text = $.only_child(p);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `Value: ${$.get(value) ?? ''}`);
		$.set_text(text_1, `Type of value: ${typeof $.get(value)}`);
	});

	$.append($$anchor, fragment);
}