import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio, Dropdown, DropdownItem, Button, Helper } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Dropdown radio<!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Dropdown_1($$anchor) {
	const binding_group = [];
	let group3 = $.state(2);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_1 = $.sibling($.first_child(fragment_1));

			ChevronDownOutline(node_1, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Dropdown(node_2, {
		simple: true,
		class: 'w-60',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_3 = $.first_child(fragment_2);

			DropdownItem(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					Radio(node_4, {
						name: 'group3',
						value: 1,
						get group() {
							return $.get(group3);
						},

						set group($$value) {
							$.set(group3, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Enable notifications');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Helper(node_5, {
						class: 'ps-6',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Some helpful instruction goes over here.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_3, 2);

			DropdownItem(node_6, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_7 = $.first_child(fragment_4);

					Radio(node_7, {
						name: 'group3',
						value: 2,
						get group() {
							return $.get(group3);
						},

						set group($$value) {
							$.set(group3, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Enable 2FA auth');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Helper(node_8, {
						class: 'ps-6',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Some helpful instruction goes over here.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 2);

			DropdownItem(node_9, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_10 = $.first_child(fragment_5);

					Radio(node_10, {
						name: 'group3',
						value: 3,
						get group() {
							return $.get(group3);
						},

						set group($$value) {
							$.set(group3, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Subscribe newsletter');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Helper(node_11, {
						class: 'ps-6',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Some helpful instruction goes over here.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}