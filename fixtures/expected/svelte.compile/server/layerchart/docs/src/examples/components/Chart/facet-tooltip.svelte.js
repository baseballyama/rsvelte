import * as $ from 'svelte/internal/server';

import {
	Axis,
	Chart,
	Circle,
	FacetAxis,
	Grid,
	Highlight,
	Svg,
	Tooltip
} from 'layerchart';

import { getPenguins } from '$lib/data.remote';

const penguins = await getPenguins();

export default function Facet_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = penguins.filter((d) => d.flipper_length_mm !== 'NA' && d.body_mass_g !== 'NA');

		Chart($$renderer, {
			data,
			x: 'flipper_length_mm',
			y: 'body_mass_g',
			fx: 'species',
			cRange: [
				'var(--color-info)',
				'var(--color-success)',
				'var(--color-warning)'
			],
			xNice: true,
			yNice: true,
			tooltipContext: { mode: 'quadtree' },
			padding: { left: 52, bottom: 32, top: 24, right: 8 },
			height: 300,
			children: ($$renderer) => {
				Svg($$renderer, {
					children: ($$renderer) => {
						FacetAxis($$renderer, {});
						$$renderer.push(`<!----> `);
						Grid($$renderer, { x: true, y: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left' });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom' });
						$$renderer.push(`<!----> `);

						Circle($$renderer, {
							cx: 'flipper_length_mm',
							cy: 'body_mass_g',
							r: 2.5,
							fill: 'island',
							fillOpacity: 0.6
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { lines: true, points: true, axis: 'both' });
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
									$$renderer.push(`<!---->${$.escape(data.species)} · ${$.escape(data.island)}`);
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
										Tooltip.Item($$renderer, { label: 'flipper', value: data.flipper_length_mm });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'mass', value: data.body_mass_g });
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
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}