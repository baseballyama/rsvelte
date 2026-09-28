import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioButton, ButtonGroup } from "flowbite-svelte";
import { ListMusicSolid, OrderedListOutline, ListOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!> <!></div> <!> <p> </p>`, 1);

export default function RadioButton_1($$anchor) {
	const binding_group = [];
	let radioGroup = $.state("notes");
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RadioButton(node, {
		value: 'notes',
		checkedClass: 'outline-4 outline-primary-500',
		get group() {
			return $.get(radioGroup);
		},

		set group($$value) {
			$.set(radioGroup, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			ListMusicSolid($$anchor, { class: 'h-7 w-7' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	RadioButton(node_1, {
		value: 'numbers',
		checkedClass: 'outline-4 outline-primary-500',
		get group() {
			return $.get(radioGroup);
		},

		set group($$value) {
			$.set(radioGroup, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			OrderedListOutline($$anchor, { class: 'h-7 w-7' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	RadioButton(node_2, {
		value: 'bullets',
		checkedClass: 'outline-4 outline-primary-500',
		get group() {
			return $.get(radioGroup);
		},

		set group($$value) {
			$.set(radioGroup, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			ListOutline($$anchor, { class: 'h-7 w-7' });
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	ButtonGroup(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			RadioButton(node_4, {
				color: 'green',
				outline: true,
				value: 'notes',
				checkedClass: 'outline-4 outline-green-500',
				get group() {
					return $.get(radioGroup);
				},

				set group($$value) {
					$.set(radioGroup, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					ListMusicSolid($$anchor, { class: 'h-7 w-7' });
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			RadioButton(node_5, {
				color: 'green',
				outline: true,
				value: 'numbers',
				checkedClass: 'outline-4 outline-green-500',
				get group() {
					return $.get(radioGroup);
				},

				set group($$value) {
					$.set(radioGroup, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					OrderedListOutline($$anchor, { class: 'h-7 w-7' });
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			RadioButton(node_6, {
				color: 'green',
				outline: true,
				value: 'bullets',
				checkedClass: 'outline-4 outline-green-500',
				get group() {
					return $.get(radioGroup);
				},

				set group($$value) {
					$.set(radioGroup, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					ListOutline($$anchor, { class: 'h-7 w-7' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node_3, 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `List style: ${$.get(radioGroup) ?? ''}`));
	$.append($$anchor, fragment);
}