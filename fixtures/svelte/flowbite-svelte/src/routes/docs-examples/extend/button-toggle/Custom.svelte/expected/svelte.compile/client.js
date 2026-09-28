import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";
import { CheckCircleOutline, BadgeCheckOutline, FileCheckOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <p class="mt-2 dark:text-white"> </p>`, 1);

export default function Custom($$anchor) {
	let singleValue = $.state(null);

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			$.set(singleValue, value, true);
			console.log("Single selection:", value);
		}
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	ButtonToggleGroup(node, {
		onSelect: handleSingleSelect,
		color: 'none',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				const iconSlot = ($$anchor) => {
					CheckCircleOutline($$anchor, { class: '-mr-3 text-green-400' });
				};

				let $0 = $.derived(() => $.get(singleValue) === "one");

				ButtonToggle(node_1, {
					value: 'one',
					get selected() {
						return $.get($0);
					},
					iconSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('One');

						$.append($$anchor, text);
					},
					$$slots: { iconSlot: true, default: true }
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const iconSlot = ($$anchor) => {
					BadgeCheckOutline($$anchor, { class: '-mr-3 text-red-400' });
				};

				let $0 = $.derived(() => $.get(singleValue) === "two");

				ButtonToggle(node_2, {
					value: 'two',
					get selected() {
						return $.get($0);
					},
					iconSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Two');

						$.append($$anchor, text_1);
					},
					$$slots: { iconSlot: true, default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				const iconSlot = ($$anchor) => {
					FileCheckOutline($$anchor, { class: '-mr-3 text-purple-400' });
				};

				let $0 = $.derived(() => $.get(singleValue) === "three");

				ButtonToggle(node_3, {
					value: 'three',
					get selected() {
						return $.get($0);
					},
					iconSlot,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Three');

						$.append($$anchor, text_2);
					},
					$$slots: { iconSlot: true, default: true }
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