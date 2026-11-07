import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<h3 class="mb-2 text-lg font-medium dark:text-white">Single Selection</h3> <!> <p class="mt-2 dark:text-white"> </p>`, 1);

export default function Disabled($$anchor) {
	let singleValue = $.state(null);

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			$.set(singleValue, value, true);
			console.log("Single selection:", value);
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
					disabled: true,
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

	$.template_effect(() => $.set_text(text_3, `Selected: ${($.get(singleValue) || "None") ?? ''}`));
	$.append($$anchor, fragment);
}