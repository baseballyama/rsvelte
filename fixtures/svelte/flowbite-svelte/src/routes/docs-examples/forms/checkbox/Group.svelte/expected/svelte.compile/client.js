import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Checkbox } from "flowbite-svelte";

var root = $.from_html(`<div class="flex gap-2"><!></div> <div class="my-2 w-44 rounded-lg border border-gray-200 p-2 dark:border-gray-700 dark:text-gray-400"> </div> <!>`, 1);

export default function Group($$anchor) {
	const binding_group = [];

	let choices = [
		{ value: "1", label: "One" },
		{ value: "2", label: "Two" },
		{ value: "3", label: "Three" }
	];

	let group = ["2", "3"];
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Checkbox(node, {
		name: 'flavours',
		get choices() {
			return choices;
		},

		get group() {
			return group;
		},

		set group($$value) {
			group = $$value;
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var text = $.only_child(div_1);
	var node_1 = $.sibling(div_1, 2);

	Button(node_1, {
		onclick: () => group.length = 0,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Clear');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.template_effect(() => $.set_text(text, `Group: ${group ?? ''}`));
	$.append($$anchor, fragment);
}