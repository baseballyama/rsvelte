import * as $ from 'svelte/internal/server';
import { Progress } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 50;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<h1>Examples</h1> <h2>Value</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Progress($$renderer, { value: 0 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 0.2 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 0.4 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 0.6 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 0.8 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 1 });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: null });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Max</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Progress($$renderer, { value: 50, max: 100 });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Color</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Progress($$renderer, { value: 0.5, class: '[--color:theme(colors.success)]' });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 0.7, class: '[--color:theme(colors.warning)]' });
					$$renderer.push(`<!----> `);
					Progress($$renderer, { value: 0.9, class: '[--color:theme(colors.danger)]' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Track color</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Progress($$renderer, {
						value: 0.5,
						class: '[--track-color:theme(colors.primary/5%)]'
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						value: 0.5,
						class: '[--color:theme(colors.success)] [--track-color:theme(colors.success/5%)]'
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						value: 0.7,
						class: '[--color:theme(colors.warning)] [--track-color:theme(colors.warning/5%)]'
					});

					$$renderer.push(`<!----> `);

					Progress($$renderer, {
						value: 0.9,
						class: '[--color:theme(colors.danger)] [--track-color:theme(colors.danger/5%)]'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2>Color based on value</h2> `);

			Preview($$renderer, {
				children: ($$renderer) => {
					Progress($$renderer, {
						class: cls(value > 90
							? '[--color:theme(colors.danger)]'
							: value > 50
								? '[--color:theme(colors.warning)]'
								: '[--color:theme(colors.success)]'),
						max: 100,
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <input type="range"${$.attr('value', value)} class="w-full"/>`);
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
	});
}