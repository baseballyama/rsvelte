import * as $ from 'svelte/internal/server';
import { Input, Label, P, Button, ButtonGroup } from "flowbite-svelte";
import { PlusOutline, MinusOutline, HomeOutline } from "flowbite-svelte-icons";

export default function ControlIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let bedroom = 3;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form class="mx-auto max-w-xs">`);

			Label($$renderer, {
				class: 'mb-2 text-sm',
				for: 'quantity_input',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose quantity:`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				class: 'relative',
				children: ($$renderer) => {
					Button($$renderer, {
						type: 'button',
						onclick: () => bedroom -= 1,
						class: 'h-11 p-3',
						children: ($$renderer) => {
							MinusOutline($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Input($$renderer, {
						min: '1',
						max: '5',
						type: 'number',
						id: 'quantity_input',
						'aria-describedby': 'helper-text-explanation',
						placeholder: ' ',
						required: true,
						class: 'h-11 w-40! pb-6 text-center',
						get value() {
							return bedroom;
						},

						set value($$value) {
							bedroom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div class="absolute start-1/2 bottom-1 flex -translate-x-1/2 items-center space-x-1 text-xs text-gray-400 rtl:translate-x-1/2 rtl:space-x-reverse">`);
					HomeOutline($$renderer, { class: 'h-4 w-4' });
					$$renderer.push(`<!----> <span>Bedrooms</span></div> `);

					Button($$renderer, {
						type: 'button',
						onclick: () => bedroom += 1,
						class: 'h-11 p-3',
						children: ($$renderer) => {
							PlusOutline($$renderer, {});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			P($$renderer, {
				id: 'helper-text-explanation',
				class: 'mt-2 text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Please select the number of bedrooms.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}