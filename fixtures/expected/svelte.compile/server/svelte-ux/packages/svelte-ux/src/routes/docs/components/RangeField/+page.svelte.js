import * as $ from 'svelte/internal/server';
import { RangeField } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let value = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>label</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, { label: 'Range' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>bind:value</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> ${$.escape(value)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>on:change</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>min / max</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, { min: 0, max: 10 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>step</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, { min: 0, max: 10, step: 0.1 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>format</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				RangeField($$renderer, { min: 0, max: 10, step: 0.1, format: 'decimal' });
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