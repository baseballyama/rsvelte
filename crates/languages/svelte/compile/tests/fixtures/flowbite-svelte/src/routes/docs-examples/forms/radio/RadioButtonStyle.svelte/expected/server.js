import * as $ from 'svelte/internal/server';
import { ButtonGroup, RadioButton } from "flowbite-svelte";

export default function RadioButtonStyle($$renderer) {
	let options = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ButtonGroup($$renderer, {
			children: ($$renderer) => {
				RadioButton($$renderer, {
					color: 'amber',
					outline: true,
					checkedClass: 'outline-4 outline-amber-500',
					name: 'options',
					value: 'Option 1',
					get group() {
						return options;
					},

					set group($$value) {
						options = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Option 1`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				RadioButton($$renderer, {
					color: 'blue',
					outline: true,
					checkedClass: 'outline-4 outline-blue-500',
					name: 'options',
					value: 'Option 2',
					get group() {
						return options;
					},

					set group($$value) {
						options = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Option 2`);
					},
					$$slots: { default: true }
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