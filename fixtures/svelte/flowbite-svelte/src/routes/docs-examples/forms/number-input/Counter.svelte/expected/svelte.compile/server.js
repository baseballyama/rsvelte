import * as $ from 'svelte/internal/server';
import { Input, Label, Button } from "flowbite-svelte";
import { PlusOutline, MinusOutline } from "flowbite-svelte-icons";

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let counterInput = 12;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<form class="mx-auto max-w-xs">`);

			Label($$renderer, {
				for: 'counter-input',
				class: 'mb-1 text-sm text-gray-900 dark:text-white',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Choose quantity:`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative flex items-center gap-2">`);

			Button($$renderer, {
				color: 'alternative',
				class: 'h-5 w-5 rounded-xl p-2',
				onclick: () => counterInput -= 1,
				children: ($$renderer) => {
					MinusOutline($$renderer, { class: 'h-2.5 w-2.5' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'counter-input',
				type: 'number',
				class: 'w-12! shrink-0 border-0 bg-transparent p-0 text-center dark:bg-transparent',
				placeholder: '',
				required: true,
				get value() {
					return counterInput;
				},

				set value($$value) {
					counterInput = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				color: 'alternative',
				class: 'h-5 w-5 rounded-xl p-2',
				onclick: () => counterInput += 1,
				children: ($$renderer) => {
					PlusOutline($$renderer, { class: 'h-2.5 w-2.5' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></form>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}