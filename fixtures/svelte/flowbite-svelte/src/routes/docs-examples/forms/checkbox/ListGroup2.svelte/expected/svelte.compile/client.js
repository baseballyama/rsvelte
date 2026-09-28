import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Listgroup } from "flowbite-svelte";

var root = $.from_html(`<p class="my-2"> </p> <!>`, 1);

export default function ListGroup2($$anchor) {
	const binding_group = [];

	let choices = [
		{ value: "svelte", label: "svelte" },
		{ value: "vue", label: "Vue JS" },
		{ value: "react", label: "React", checked: true },
		{ value: "angular", label: "Angular" }
	];

	let group = $.state($.proxy([]));
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	Listgroup(node, {
		class: 'w-48',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				get choices() {
					return choices;
				},
				classes: { div: "p-3" },
				get group() {
					return $.get(group);
				},

				set group($$value) {
					$.set(group, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.template_effect(($0) => $.set_text(text, `Choices: ${$0 ?? ''}`), [() => $.get(group).join(", ")]);
	$.append($$anchor, fragment);
}