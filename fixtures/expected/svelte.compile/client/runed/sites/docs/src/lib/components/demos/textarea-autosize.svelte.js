import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextareaAutosize } from "runed";
import { DemoContainer, Textarea } from "@svecodocs/kit";

var root = $.from_html(`<label class="block" for="textarea-auto">Behold, the growing textarea!</label> <!>`, 1);

export default function Textarea_autosize($$anchor, $$props) {
	$.push($$props, true);

	let element = $.state(null);
	let input = $.state("");

	new TextareaAutosize({ element: () => $.get(element), input: () => $.get(input) });

	DemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1), 2);

			Textarea(node, {
				class: 'mt-2 min-h-2 resize-none',
				id: 'textarea-auto',
				placeholder: 'Type a lot, and you\'ll see me grow',
				get value() {
					return $.get(input);
				},

				set value($$value) {
					$.set(input, $$value, true);
				},

				get ref() {
					return $.get(element);
				},

				set ref($$value) {
					$.set(element, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}