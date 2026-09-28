import * as $ from 'svelte/internal/server';
import Scene from './Scene.svelte';
import { Canvas } from '@threlte/core';
import { BVHSplitStrategy } from '@threlte/extras';
import { Pane, Checkbox, List, Slider } from 'svelte-tweakpane-ui';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const options = {
			enabled: true,
			strategy: BVHSplitStrategy.SAH,
			indirect: false,
			verbose: false,
			maxDepth: 40,
			maxLeafTris: 20,
			setBoundingBox: true,
			firstHitOnly: false,
			helper: false
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Pane($$renderer, {
				title: 'bvh',
				position: 'fixed',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'enabled',
						get value() {
							return options.enabled;
						},

						set value($$value) {
							options.enabled = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'helper',
						get value() {
							return options.helper;
						},

						set value($$value) {
							options.helper = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'firstHitOnly',
						get value() {
							return options.firstHitOnly;
						},

						set value($$value) {
							options.firstHitOnly = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'setBoundingBox',
						get value() {
							return options.setBoundingBox;
						},

						set value($$value) {
							options.setBoundingBox = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					List($$renderer, {
						label: 'strategy',
						options: {
							SAH: BVHSplitStrategy.SAH,
							CENTER: BVHSplitStrategy.CENTER,
							AVERAGE: BVHSplitStrategy.AVERAGE
						},

						get value() {
							return options.strategy;
						},

						set value($$value) {
							options.strategy = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'maxDepth',
						step: 1,
						get value() {
							return options.maxDepth;
						},

						set value($$value) {
							options.maxDepth = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Slider($$renderer, {
						label: 'maxLeafTris',
						step: 1,
						get value() {
							return options.maxLeafTris;
						},

						set value($$value) {
							options.maxLeafTris = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, $.spread_props([options]));
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