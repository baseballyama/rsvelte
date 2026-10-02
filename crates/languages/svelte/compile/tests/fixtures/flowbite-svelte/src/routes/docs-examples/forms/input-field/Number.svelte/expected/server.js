import * as $ from 'svelte/internal/server';
import { Input, Label } from "flowbite-svelte";

export default function Number($$renderer) {
	let value = 5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			class: 'mb-4 flex flex-col gap-2',
			children: ($$renderer) => {
				$$renderer.push(`<span>Your Age</span> `);

				Input($$renderer, {
					type: 'number',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="dark:text-white"><p>Value: ${$.escape(value)}</p> <p>Type of value: ${$.escape(typeof value)}</p></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}