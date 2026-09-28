import * as $ from 'svelte/internal/server';
import { Select, Label } from "flowbite-svelte";

export default function Event($$renderer) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	let eventSelected = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select an option `);

				Select($$renderer, {
					class: 'mt-2',
					items: countries,
					clearable: true,
					onClear: () => {
						alert("Clicked clear button!");
					},

					onchange: () => {
						console.log("Changed select value:");
					},

					get value() {
						return eventSelected;
					},

					set value($$value) {
						eventSelected = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}