import * as $ from 'svelte/internal/server';
import { scaleUtc } from 'd3-scale';
import { utcDay } from 'd3-time';
import { Axis, Bars, Chart, Highlight, Layer, Rule, Tooltip } from 'layerchart';
import { getAppleTicker } from '$lib/data.remote.js';

const data = await getAppleTicker();

export default function Candlestick_with_brushing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let xDomain = [null, null];

		Chart($$renderer, {
			data: data.filter((d) => (xDomain?.[0] == null || d.date >= xDomain?.[0]) && (xDomain?.[1] == null || d.date <= xDomain?.[1])),
			x: 'date',
			xScale: scaleUtc(),
			xDomain,
			y: ['high', 'low'],
			yNice: true,
			c: (d) => d.close < d.open ? 'desc' : 'asc',
			cDomain: ['desc', 'asc'],
			cRange: ['var(--color-danger)', 'var(--color-success)'],
			padding: { left: 20, bottom: 32, top: 20 },
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true, tickSpacing: 20 });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true, tickMultiline: true });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: ['high', 'low'] });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { y: ['open', 'close'], strokeWidth: 3 });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { lines: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.date, format: 'day' });
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
										Tooltip.Item($$renderer, { label: 'Open', value: data.open, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Close', value: data.close, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'High', value: data.high, format: 'decimal' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Low', value: data.low, format: 'decimal' });
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

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			data,
			x: 'date',
			xScale: scaleUtc(),
			xInterval: utcDay,
			y: 'volume',
			yNice: true,
			height: 40,
			brush: {
				onChange: (e) => {
					xDomain = e.brush.x;
				}
			},

			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Bars($$renderer, { insets: { x: 0.5 } });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
		$.bind_props($$props, { data });
	});
}