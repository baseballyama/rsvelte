import * as $ from 'svelte/internal/server';
import { Input, Label, P, Button, ButtonGroup } from "flowbite-svelte";
import { PlusOutline, MinusOutline } from "flowbite-svelte-icons";

export default function Control($$renderer) {
	let quantity = 12345;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form class="mx-auto max-w-xs">`);

		Label($$renderer, {
			class: 'mb-2 text-sm',
			for: 'quantity-input',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Choose quantity:`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="relative flex max-w-[14rem] items-center">`);

		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					type: 'button',
					id: 'decrement-button',
					onclick: () => quantity -= 1,
					children: ($$renderer) => {
						MinusOutline($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					type: 'number',
					id: 'quantity-input',
					'aria-describedby': 'helper-text-explanation',
					placeholder: '999',
					required: true,
					class: 'w-32! text-center',
					get value() {
						return quantity;
					},

					set value($$value) {
						quantity = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'button',
					id: 'increment-button',
					onclick: () => quantity += 1,
					children: ($$renderer) => {
						PlusOutline($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		P($$renderer, {
			id: 'helper-text-explanation',
			class: 'mt-2 text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Please select a 5 digit number from 0 to 9.`);
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
}