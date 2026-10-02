import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

export default function ButtonColor($$renderer) {
	let singleValue = null;

	function handleSingleSelect(value) {
		if (typeof value === "string" || value === null) {
			singleValue = value;
			console.log("Single selection:", value);
		}
	}

	$$renderer.push(`<p class="mt-2 dark:text-white">Selected: ${$.escape(singleValue || "None")}</p> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				color: 'red',
				value: 'red',
				selected: singleValue === "red",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Red`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				color: 'green',
				value: 'green',
				selected: singleValue === "green",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Green`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				color: 'blue',
				value: 'blue',
				selected: singleValue === "blue",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Blue`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonToggleGroup($$renderer, {
		onSelect: handleSingleSelect,
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				color: 'gray',
				value: 'gray',
				selected: singleValue === "gray",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Gray`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				color: 'lime',
				value: 'lime',
				selected: singleValue === "lime",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lime`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				color: 'purple',
				value: 'purple',
				selected: singleValue === "purple",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Purple`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}