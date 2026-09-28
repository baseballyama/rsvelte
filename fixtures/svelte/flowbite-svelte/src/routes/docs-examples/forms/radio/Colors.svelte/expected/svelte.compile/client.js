import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<p>Select color</p> <div class="flex gap-4"><!> <!> <!> <!> <!> <!></div>`, 1);

export default function Colors($$anchor) {
	const binding_group = [];
	let colors = $.state("text-purple-500");
	var fragment = root();
	var p = $.first_child(fragment);
	var div = $.sibling(p, 2);
	var node = $.child(div);

	Radio(node, {
		color: 'red',
		value: 'text-red-500',
		get group() {
			return $.get(colors);
		},

		set group($$value) {
			$.set(colors, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Red');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Radio(node_1, {
		color: 'green',
		value: 'text-green-500',
		get group() {
			return $.get(colors);
		},

		set group($$value) {
			$.set(colors, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Green');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Radio(node_2, {
		color: 'purple',
		value: 'text-purple-500',
		get group() {
			return $.get(colors);
		},

		set group($$value) {
			$.set(colors, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Purple');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Radio(node_3, {
		color: 'teal',
		value: 'text-teal-500',
		get group() {
			return $.get(colors);
		},

		set group($$value) {
			$.set(colors, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Teal');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Radio(node_4, {
		color: 'yellow',
		value: 'text-yellow-500',
		get group() {
			return $.get(colors);
		},

		set group($$value) {
			$.set(colors, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Yellow');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Radio(node_5, {
		color: 'orange',
		value: 'text-orange-500',
		get group() {
			return $.get(colors);
		},

		set group($$value) {
			$.set(colors, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Orange');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.template_effect(() => $.set_class(p, 1, `mb-4 font-semibold ${$.get(colors) ?? ''}`));
	$.append($$anchor, fragment);
}