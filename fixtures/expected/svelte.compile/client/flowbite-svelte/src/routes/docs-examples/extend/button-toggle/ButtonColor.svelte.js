import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p class="mt-2 dark:text-white"> </p> <!> <!>`, 1);

export default function ButtonColor($$anchor) {
	let singleValue = $.state(null);

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			$.set(singleValue, value, true);
			console.log("Single selection:", value);
		}
	}

	var fragment = root_1();
	var p = $.first_child(fragment);
	var text = $.only_child(p);
	var node = $.sibling(p, 2);

	ButtonToggleGroup(node, {
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(singleValue) === "red");

				ButtonToggle(node_1, {
					color: 'red',
					value: 'red',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Red');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "green");

				ButtonToggle(node_2, {
					color: 'green',
					value: 'green',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Green');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "blue");

				ButtonToggle(node_3, {
					color: 'blue',
					value: 'blue',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('Blue');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	ButtonToggleGroup(node_4, {
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "gray");

				ButtonToggle(node_5, {
					color: 'gray',
					value: 'gray',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Gray');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "lime");

				ButtonToggle(node_6, {
					color: 'lime',
					value: 'lime',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Lime');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "purple");

				ButtonToggle(node_7, {
					color: 'purple',
					value: 'purple',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Purple');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.template_effect(() => $.set_text(text, `Selected: ${($.get(singleValue) || "None") ?? ''}`));
	$.append($$anchor, fragment);
}