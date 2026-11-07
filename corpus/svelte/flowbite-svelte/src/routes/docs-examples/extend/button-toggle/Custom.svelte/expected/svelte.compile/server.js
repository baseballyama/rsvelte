import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";
import { CheckCircleOutline, BadgeCheckOutline, FileCheckOutline } from "flowbite-svelte-icons";

export default function Custom($$renderer) {
	let singleValue = null;

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			singleValue = value;
			console.log("Single selection:", value);
		}
	}

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		color: 'none',
		children: ($$renderer) => {
			{
				function iconSlot($$renderer) {
					CheckCircleOutline($$renderer, { class: '-mr-3 text-green-400' });
				}

				ButtonToggle($$renderer, {
					value: 'one',
					selected: singleValue === "one",
					iconSlot,
					children: ($$renderer) => {
						$$renderer.push(`<!---->One`);
					},
					$$slots: { iconSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function iconSlot($$renderer) {
					BadgeCheckOutline($$renderer, { class: '-mr-3 text-red-400' });
				}

				ButtonToggle($$renderer, {
					value: 'two',
					selected: singleValue === "two",
					iconSlot,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Two`);
					},
					$$slots: { iconSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function iconSlot($$renderer) {
					FileCheckOutline($$renderer, { class: '-mr-3 text-purple-400' });
				}

				ButtonToggle($$renderer, {
					value: 'three',
					selected: singleValue === "three",
					iconSlot,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Three`);
					},
					$$slots: { iconSlot: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-2 dark:text-white">Selected: ${$.escape(singleValue || "None")}</p>`);
}