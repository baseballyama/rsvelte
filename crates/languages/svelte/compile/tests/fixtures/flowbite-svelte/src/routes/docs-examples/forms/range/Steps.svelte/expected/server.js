import * as $ from 'svelte/internal/server';
import { Range, Label } from "flowbite-svelte";

export default function Steps($$renderer) {
	let stepValue = 2.5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Range steps`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Range($$renderer, {
			id: 'range-steps',
			min: '0',
			max: '5',
			step: '0.5',
			get value() {
				return stepValue;
			},

			set value($$value) {
				stepValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p>Value: ${$.escape(stepValue)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}