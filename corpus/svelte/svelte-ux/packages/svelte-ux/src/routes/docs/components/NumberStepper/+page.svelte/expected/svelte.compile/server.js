import * as $ from 'svelte/internal/server';
import { NumberStepper } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let value = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>bind:value</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, {
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
				NumberStepper($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Dense</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, { dense: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Min / Max</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, { min: 0, max: 10 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Step</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, { step: 0.1 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Prefix</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, {
					class: 'w-28',
					$$slots: {
						prefix: ($$renderer) => {
							$$renderer.push(`<span slot="prefix">$</span>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Suffix</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NumberStepper($$renderer, {
					class: 'w-28',
					$$slots: {
						suffix: ($$renderer) => {
							$$renderer.push(`<span slot="suffix">kg</span>`);
						}
					}
				});
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