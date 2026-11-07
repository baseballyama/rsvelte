import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ElementRef($$anchor) {
	let selectRef = $.state(void 0);

	const options = [
		{ value: "option1", name: "Option 1" },
		{ value: "option2", name: "Option 2" },
		{ value: "option3", name: "Option 3" }
	];

	let selectedValue = $.state("option1");
	var fragment = root();
	var node = $.first_child(fragment);

	Select(node, {
		get items() {
			return options;
		},
		class: 'my-4',
		get elementRef() {
			return $.get(selectRef);
		},

		set elementRef($$value) {
			$.set(selectRef, $$value, true);
		},

		get value() {
			return $.get(selectedValue);
		},

		set value($$value) {
			$.set(selectedValue, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick: () => {
			// programmatically change the selection
			$.get(selectRef // This would select Option 2
			).selectedIndex = 2;

			$.set(selectedValue, "option2");
			$.get(selectRef)?.focus();
			console.log(`Selected index: ${$.get(selectRef)?.selectedIndex}`);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Access Select');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}