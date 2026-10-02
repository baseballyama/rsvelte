import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Spline, Trail } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import TrailControls from '$lib/components/controls/TrailControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			show: false,
			pathGenerator: (x) => x,
			amplitude: 1,
			frequency: 10,
			phase: 0,
			curve: undefined,
			cap: 'round',
			pointCount: 30,
			showLine: true,
			motion: 'tween'
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
			TrailControls($$renderer, {
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
				yNice: true,
				r: 'y',
				rScale: scaleLinear(),
				rRange: [2, 16],
				padding: 25,
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							if (config.show) {
								$$renderer.push('<!--[0-->');

								Trail($$renderer, {
									curve: config.curve,
									cap: config.cap,
									motion: config.motion,
									class: 'fill-primary'
								});

								$$renderer.push(`<!----> `);

								if (config.showLine) {
									$$renderer.push('<!--[0-->');

									Spline($$renderer, {
										curve: config.curve,
										motion: config.motion,
										class: 'stroke-surface-content/30 stroke-1'
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
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