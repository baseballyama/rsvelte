import * as $ from 'svelte/internal/server';
import { Select, Button } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	let selectRef = void 0;

	const options = [
		{ value: "option1", name: "Option 1" },
		{ value: "option2", name: "Option 2" },
		{ value: "option3", name: "Option 3" }
	];

	let selectedValue = "option1";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Select($$renderer, {
			items: options,
			class: 'my-4',
			get elementRef() {
				return selectRef;
			},

			set elementRef($$value) {
				selectRef = $$value;
				$$settled = false;
			},

			get value() {
				return selectedValue;
			},

			set value($$value) {
				selectedValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => {
				// programmatically change the selection
				selectRef.selectedIndex = 2; // This would select Option 2

				selectedValue = "option2";
				selectRef?.focus();
				console.log(`Selected index: ${selectRef?.selectedIndex}`);
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Access Select`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}