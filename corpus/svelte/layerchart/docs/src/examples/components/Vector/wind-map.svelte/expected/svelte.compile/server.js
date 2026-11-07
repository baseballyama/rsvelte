import * as $ from 'svelte/internal/server';
import { max } from 'd3-array';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { Axis, Chart, Layer, Vector, Tooltip } from 'layerchart';
import { getWind } from '$lib/geo.remote.js';

const windData = await getWind();

export default function Wind_map($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const wind = windData.map((d) => {
			const speed = Math.hypot(d.u, d.v);
			const angle = Math.atan2(d.u, d.v) * 180 / Math.PI;

			return { ...d, speed, angle };
		});

		const colorScale = scaleSequential(interpolateTurbo).domain([0, max(wind, (d) => d.speed)]);
		const data = { wind: windData };

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left' });
						$$renderer.push(`<!----> `);

						Vector($$renderer, {
							x: 'longitude',
							y: 'latitude',
							length: 'speed',
							rotate: 'angle',
							anchor: 'middle',
							stroke: (d) => colorScale(d.speed),
							strokeWidth: 1
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Wind`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Speed (m/s)', value: data.speed, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Direction', value: data.angle, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				data: wind,
				x: 'longitude',
				y: 'latitude',
				r: 'speed',
				rRange: [0, 20],
				padding: { top: 10, bottom: 10, left: 10, right: 10 },
				tooltipContext: { mode: 'quadtree' },
				height: 500,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}