import * as $ from 'svelte/internal/server';
import { Range, Label } from "flowbite-svelte";

export default function MinAndMax($$renderer) {
	let minmaxValue = 5;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Min-max range`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Range($$renderer, {
			id: 'range-minmax',
			min: '0',
			max: '10',
			get value() {
				return minmaxValue;
			},

			set value($$value) {
				minmaxValue = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p>Value: ${$.escape(minmaxValue)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}