import * as $ from 'svelte/internal/server';
import { RangeSlider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let value = [25, 75];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Description</h2> <h2>basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, { disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>bind:value</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>min/max</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, { min: 50, max: 100 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>step</h2> <h3>small</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, { max: 1, step: 0.01 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>step</h2> <h3>large</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, { max: 100, step: 10 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>disableTooltips</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeSlider($$renderer, { disableTooltips: true });
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