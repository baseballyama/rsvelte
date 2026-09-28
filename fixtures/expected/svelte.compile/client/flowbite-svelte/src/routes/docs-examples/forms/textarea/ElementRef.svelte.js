import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ElementRef($$anchor) {
	let textareaRef = $.state(void 0);
	let textContent = $.state("This is some example text that will be selected when you click the button.");
	var fragment = root();
	var node = $.first_child(fragment);

	Textarea(node, {
		placeholder: 'Type something here...',
		class: 'w-full',
		get elementRef() {
			return $.get(textareaRef);
		},

		set elementRef($$value) {
			$.set(textareaRef, $$value, true);
		},

		get value() {
			return $.get(textContent);
		},

		set value($$value) {
			$.set(textContent, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		class: 'mt-2',
		onclick: () => {
			$.get(textareaRef)?.focus();
			$.get(textareaRef)?.setSelectionRange(0, $.get(textareaRef).value.length);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select All Text');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}