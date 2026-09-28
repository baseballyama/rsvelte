import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, MotionPath, Polygon, Spline } from 'layerchart';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';
import MotionPathControls from '$lib/components/controls/MotionPathControls.svelte';

export default function Repeat_indefinitely($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			pointCount: 100,
			pathGenerator: (x) => x,
			curve: undefined,
			amplitude: 1,
			frequency: 10,
			phase: 0,
			show: false,
			duration: '5s',
			repeatCount: 'indefinite',
			start: undefined
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
			MotionPathControls($$renderer, {
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
				padding: { left: 16, bottom: 24 },
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

								{
									function children($$renderer, { pathId, objectId }) {
										Spline($$renderer, { id: pathId, curve: config.curve });
										$$renderer.push(`<!----> `);

										Polygon($$renderer, {
											id: objectId,
											r: 10,
											points: 3,
											class: 'stroke-surface-content fill-surface-100'
										});

										$$renderer.push(`<!---->`);
									}

									MotionPath($$renderer, $.spread_props([
										{ duration: config.duration, repeatCount: config.repeatCount },
										config.start ? { begin: config.start } : {},
										{ children, $$slots: { default: true } }
									]));
								}
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