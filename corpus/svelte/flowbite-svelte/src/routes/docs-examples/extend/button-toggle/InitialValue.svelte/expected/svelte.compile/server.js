import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

export default function InitialValue($$renderer) {
	let singleValue = "two";
	let multiValues = ["one", "three"];

	$$renderer.push(`<h3 class="mb-2 text-lg font-medium dark:text-white">Single Selection</h3> `);

	ButtonToggleGroup($$renderer, {
		value: singleValue,
		onSelect: (v) => {
			if (typeof v === "string" || v === null) {
				singleValue = v;
			}
		},

		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-2 dark:text-white">Selected: ${$.escape(singleValue || "None")}</p> <h3 class="mb-2 text-lg font-medium dark:text-white">Multi Selection</h3> `);

	ButtonToggleGroup($$renderer, {
		multiSelect: true,
		value: multiValues,
		onSelect: (v) => {
			if (Array.isArray(v)) {
				multiValues = v;
			}
		},

		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				value: 'one',
				children: ($$renderer) => {
					$$renderer.push(`<!---->One`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'two',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Two`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonToggle($$renderer, {
				value: 'three',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Three`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p class="mt-2 dark:text-white">Selected: ${$.escape(multiValues.length ? multiValues.join(", ") : "None")}</p>`);
}