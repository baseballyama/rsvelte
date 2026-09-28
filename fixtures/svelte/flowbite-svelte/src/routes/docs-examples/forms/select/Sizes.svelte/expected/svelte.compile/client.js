import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <p class="my-6"></p> <!> <!> <!> <!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'select-sm',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small select');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Select(node_1, {
		id: 'select-sm',
		size: 'sm',
		get items() {
			return countries;
		},
		class: 'mb-6'
	});

	var node_2 = $.sibling(node_1, 2);

	Label(node_2, {
		for: 'select-md',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Default select');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Select(node_3, {
		id: 'select-md',
		size: 'md',
		get items() {
			return countries;
		},
		class: 'mb-6'
	});

	var node_4 = $.sibling(node_3, 2);

	Label(node_4, {
		for: 'select-lg',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Large select');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Select(node_5, {
		id: 'select-lg',
		size: 'lg',
		get items() {
			return countries;
		},
		class: 'mb-6'
	});

	var node_6 = $.sibling(node_5, 4);

	Label(node_6, {
		for: 'select-sm',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Underline small select');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Select(node_7, {
		id: 'select-sm',
		underline: true,
		size: 'sm',
		get items() {
			return countries;
		},
		class: 'mb-6'
	});

	var node_8 = $.sibling(node_7, 2);

	Label(node_8, {
		for: 'select-md',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Underline default select');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Select(node_9, {
		id: 'select-md',
		underline: true,
		size: 'md',
		get items() {
			return countries;
		},
		class: 'mb-6'
	});

	var node_10 = $.sibling(node_9, 2);

	Label(node_10, {
		for: 'select-lg',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Underline large select');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Select(node_11, {
		id: 'select-lg',
		underline: true,
		size: 'lg',
		get items() {
			return countries;
		},
		class: 'mb-6'
	});

	$.append($$anchor, fragment);
}