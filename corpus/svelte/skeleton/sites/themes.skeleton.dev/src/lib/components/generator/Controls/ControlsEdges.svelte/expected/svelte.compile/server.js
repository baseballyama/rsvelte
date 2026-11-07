import * as $ from 'svelte/internal/server';
import Edges from '$lib/components/generator/Edges/Edges.svelte';
import * as constants from '$lib/constants/generator';
import { settingsCorners, settingsEdges } from '$lib/state/generator.svelte';

export default function ControlsEdges($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Constants
		// Components
		// State
		// The 'inherit' corner shape has no distinct visual, so it's excluded from the preview grid.
		const cornerShapeOptions = constants.cornerShapes.filter((shape) => shape !== 'inherit');

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-8"><section class="space-y-2"><header><h2 class="h5">Border Radius</h2> <p class="opacity-50">Adjust settings for border radius utility classes.</p></header> <div class="label"><span class="label-text">Base</span> `);

			Edges($$renderer, {
				name: 'rounded-base',
				items: [
					'0rem',
					'0.063rem',
					'0.125rem',
					'0.25rem',
					'0.375rem',
					'0.75rem',
					'9999rem'
				],

				get value() {
					return settingsEdges['--radius-base'];
				},

				set value($$value) {
					settingsEdges['--radius-base'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="label"><span class="label-text">Container</span> `);

			Edges($$renderer, {
				name: 'rounded-container',
				items: [
					'0rem',
					'0.063rem',
					'0.125rem',
					'0.25rem',
					'0.375rem',
					'0.75rem',
					'1.5rem'
				],

				get value() {
					return settingsEdges['--radius-container'];
				},

				set value($$value) {
					settingsEdges['--radius-container'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></section> <section class="space-y-4"><header><h2 class="h5">Corner Shape</h2> <p class="opacity-50">Available via the the <a class="underline" href="https://skeleton.dev/docs/svelte/tailwind-utilities/corner-shapes" target="_blank" rel="noopener noreferrer">corner shape</a> utility.</p></header> <div class="label"><span class="label-text">Base</span> `);

			Edges($$renderer, {
				name: '--corner-shape-base',
				items: cornerShapeOptions,
				mode: 'corner',
				get value() {
					return settingsCorners['--corner-shape-base'];
				},

				set value($$value) {
					settingsCorners['--corner-shape-base'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="label"><span class="label-text">Container</span> `);

			Edges($$renderer, {
				name: '--corner-shape-container',
				items: cornerShapeOptions,
				mode: 'corner',
				get value() {
					return settingsCorners['--corner-shape-container'];
				},

				set value($$value) {
					settingsCorners['--corner-shape-container'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></section> <section class="space-y-4"><header><h2 class="h5">Edge Defaults</h2> <p class="opacity-50">Set the default edge sizing.</p></header> <div class="label"><span class="label-text">Border Width</span> `);

			Edges($$renderer, {
				name: 'borders',
				items: ['1px', '2px', '4px', '6px'],
				mode: 'thickness',
				get value() {
					return settingsEdges['--default-border-width'];
				},

				set value($$value) {
					settingsEdges['--default-border-width'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="label"><span class="label-text">Ring Width</span> `);

			Edges($$renderer, {
				name: 'rings',
				items: ['1px', '2px', '4px', '6px'],
				mode: 'thickness',
				get value() {
					return settingsEdges['--default-ring-width'];
				},

				set value($$value) {
					settingsEdges['--default-ring-width'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <div class="label"><span class="label-text">Outline Width</span> `);

			Edges($$renderer, {
				name: 'outlines',
				items: ['1px', '2px', '4px', '6px'],
				mode: 'thickness',
				get value() {
					return settingsEdges['--default-outline-width'];
				},

				set value($$value) {
					settingsEdges['--default-outline-width'] = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></section></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}