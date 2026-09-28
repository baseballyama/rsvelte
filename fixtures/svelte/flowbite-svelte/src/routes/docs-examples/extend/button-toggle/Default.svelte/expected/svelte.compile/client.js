import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<h3 class="mb-2 text-lg font-medium dark:text-white">Single Selection</h3> <!> <p class="mt-2 dark:text-white"> </p> <h3 class="mb-2 text-lg font-medium dark:text-white">Multi Selection</h3> <!> <p class="mt-2 dark:text-white"> </p>`, 1);

export default function Default($$anchor) {
	let singleValue = $.state(null);
	let multiValues = $.state($.proxy([]));

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			$.set(singleValue, value, true);
			console.log("Single selection:", value);
		}
	}

	function handleMultiSelect(values) {
		if (Array.isArray(values)) {
			$.set(multiValues, values, true);
			console.log("Multi selection:", values);
		}
	}

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	ButtonToggleGroup(node, {
		onSelect: handleSingleSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_1, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('One');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_2, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Two');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_3, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Three');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var text_3 = $.only_child(p);
	var node_4 = $.sibling(p, 4);

	ButtonToggleGroup(node_4, {
		multiSelect: true,
		onSelect: handleMultiSelect,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_5 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => $.get(multiValues).includes("one"));

				ButtonToggle(node_5, {
					value: 'one',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('One');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => $.get(multiValues).includes("two"));

				ButtonToggle(node_6, {
					value: 'two',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Two');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => $.get(multiValues).includes("three"));

				ButtonToggle(node_7, {
					value: 'three',
					get selected() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Three');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var p_1 = $.sibling(node_4, 2);
	var text_7 = $.only_child(p_1);

	$.template_effect(
		($0) => {
			$.set_text(text_3, `Selected: ${($.get(singleValue) || "None") ?? ''}`);
			$.set_text(text_7, `Selected: ${$0 ?? ''}`);
		},
		[
			() => $.get(multiValues).length ? $.get(multiValues).join(", ") : "None"
		]
	);

	$.append($$anchor, fragment);
}