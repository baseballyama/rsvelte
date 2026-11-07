import * as $ from 'svelte/internal/server';
import { ButtonToggleGroup, ButtonToggle } from "flowbite-svelte";

export default function Ctx($$renderer) {
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
		ctxIconClass: 'text-white',
		ctxBtnClass: 'data-[selected=true]:bg-rose-400 data-[selected=false]:hover:bg-rose-300',
		children: ($$renderer) => {
			ButtonToggle($$renderer, {
				class: 'data-[selected=false]:hover:bg-green-300 data-[selected=true]:bg-green-400',
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