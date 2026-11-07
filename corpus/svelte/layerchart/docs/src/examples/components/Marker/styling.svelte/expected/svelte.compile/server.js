import * as $ from 'svelte/internal/server';
import { Chart, Spline, Layer } from 'layerchart';
import MarkerControls from '$lib/components/controls/MarkerControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Styling($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			show: true,
			tweened: true,
			pathGenerator: (x) => x,
			curve: undefined,
			pointCount: 10,
			amplitude: 1,
			frequency: 10,
			phase: 0
		};

		const data = $.derived(() => Array.from({ length: config.pointCount }).map((_, i) => {
			return {
				x: i + 1,
				y: config.pathGenerator(i / config.pointCount) ?? i
			};
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MarkerControls($$renderer, {
				get config() {
					return config;
				},

				set config($$value) {
					config = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data: data(),
				x: 'x',
				y: 'y',
				height: 200,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							if (config.show) {
								$$renderer.push('<!--[0-->');

								Spline($$renderer, {
									curve: config.curve,
									class: 'stroke-primary stroke-2',
									markerStart: { type: 'circle', size: 20, class: 'stroke-2 fill-secondary' },
									markerMid: { type: 'line', class: 'stroke-2 stroke-accent' },
									markerEnd: {
										type: 'triangle',
										size: 20,
										class: 'stroke-2 stroke-surface-100 fill-secondary'
									},
									motion: config.tweened ? 'tween' : 'none'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
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
		$.bind_props($$props, { data });
	});
}