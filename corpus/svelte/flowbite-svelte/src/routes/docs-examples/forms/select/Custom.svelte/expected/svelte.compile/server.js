import * as $ from 'svelte/internal/server';
import { Select, Label } from "flowbite-svelte";

export default function Custom($$renderer) {
	let selected = void 0;

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			for: 'countries',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select an option`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Select($$renderer, {
			id: 'countries',
			class: 'mt-2',
			placeholder: '',
			get value() {
				return selected;
			},

			set value($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.option({ selected: true, value: 'all' }, ($$renderer) => {
					$$renderer.push(`All`);
				});

				$$renderer.push(` <!--[-->`);

				const each_array = $.ensure_array_like(countries);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { value, name } = each_array[$$index];

					$$renderer.option({ value }, ($$renderer) => {
						$$renderer.push(`${$.escape(name)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
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