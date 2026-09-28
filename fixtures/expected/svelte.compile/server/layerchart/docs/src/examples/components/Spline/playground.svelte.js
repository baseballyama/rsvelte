import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Spline, Points } from 'layerchart';
import SplineControls from '$lib/components/controls/SplineControls.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Playground($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			show: false,
			showPoints: false,
			pointCount: 100,
			pathGenerator: (x) => x,
			curve: undefined,
			amplitude: 1,
			frequency: 10,
			phase: 0,
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
			SplineControls($$renderer, {
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

								Spline($$renderer, {
									curve: config.curve,
									motion: config.motion === 'tween' ? 'tween' : 'none',
									draw: config.motion === 'draw',
									class: 'stroke-primary stroke-2'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (config.showPoints) {
								$$renderer.push('<!--[0-->');

								Points($$renderer, {
									motion: config.motion === 'tween' ? 'tween' : 'none',
									r: 3,
									class: 'fill-surface-100 stroke-primary'
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