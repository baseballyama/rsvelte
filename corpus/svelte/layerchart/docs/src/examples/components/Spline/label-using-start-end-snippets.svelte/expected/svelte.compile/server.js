import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer, Spline, Circle, Text } from 'layerchart';
import SplineControls from '$lib/components/controls/SplineControls2.svelte';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Label_using_start_end_snippets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let config = {
			show: true,
			pointCount: 100,
			amplitude: 1,
			frequency: 10,
			phase: 0,
			curve: undefined,
			pathGenerator: (x) => x
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

								{
									function startContent($$renderer) {
										Circle($$renderer, { r: 5, class: 'fill-primary' });
										$$renderer.push(`<!----> `);

										Text($$renderer, {
											value: 'start',
											textAnchor: 'start',
											verticalAnchor: 'middle',
											dx: 8
										});

										$$renderer.push(`<!---->`);
									}

									function endContent($$renderer) {
										Circle($$renderer, { r: 5, class: 'fill-primary' });
										$$renderer.push(`<!----> `);
										Text($$renderer, { value: 'end', verticalAnchor: 'middle', dx: 8 });
										$$renderer.push(`<!---->`);
									}

									Spline($$renderer, {
										curve: config.curve,
										class: 'stroke-primary stroke-2',
										startContent,
										endContent,
										$$slots: { startContent: true, endContent: true }
									});
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