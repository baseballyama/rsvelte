import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

export default function Disabled($$renderer) {
	let singleValue = null;

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			singleValue = value;
			console.log("Single selection:", value);
		}
	}

	$$renderer.push(`<h3 class="mb-2 text-lg font-medium dark:text-white">Single Selection</h3> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				disabled: true,
				value: 'one',
				selected: singleValue === "one",
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				selected: singleValue === "two",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				selected: singleValue === "three",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-2 dark:text-white">Selected: ${$.escape(singleValue || "None")}</p>`);
}