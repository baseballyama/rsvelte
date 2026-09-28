import * as $ from 'svelte/internal/server';
import { Label, Select } from "flowbite-svelte";

export default function Select_1($$renderer) {
	let selected = "";

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select an option `);

				Select($$renderer, {
					class: 'mt-2',
					items: countries,
					get value() {
						return selected;
					},

					set value($$value) {
						selected = $$value;
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