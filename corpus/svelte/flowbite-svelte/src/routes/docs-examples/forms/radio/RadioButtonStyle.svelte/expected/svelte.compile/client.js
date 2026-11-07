import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, RadioButton } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function RadioButtonStyle($$anchor) {
	const binding_group = [];
	let options = $.state(void 0);

	ButtonGroup($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			RadioButton(node, {
				color: 'amber',
				outline: true,
				checkedClass: 'outline-4 outline-amber-500',
				name: 'options',
				value: 'Option 1',
				get group() {
					return $.get(options);
				},

				set group($$value) {
					$.set(options, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Option 1');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			RadioButton(node_1, {
				color: 'blue',
				outline: true,
				checkedClass: 'outline-4 outline-blue-500',
				name: 'options',
				value: 'Option 2',
				get group() {
					return $.get(options);
				},

				set group($$value) {
					$.set(options, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Option 2');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}