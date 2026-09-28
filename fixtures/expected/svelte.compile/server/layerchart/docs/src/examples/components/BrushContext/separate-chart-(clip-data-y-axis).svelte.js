import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, ChartClipPath, Layer, LinearGradient } from 'layerchart';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Separate_chart__clip_data_y_axis_($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let yDomain = [null, null];

		$$renderer.push(`<div class="grid grid-cols-[40px_1fr]"><div>`);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			padding: { bottom: 24 },
			brush: {
				axis: 'y',
				onChange: (e) => {
					yDomain = e.brush.y;
				}
			},
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Chart($$renderer, {
			data,
			x: 'date',
			y: 'value',
			yDomain,
			padding: { left: 32, bottom: 24 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						ChartClipPath($$renderer, {
							children: ($$renderer) => {
								{
									function children($$renderer, { gradient }) {
										Area($$renderer, { line: { class: 'stroke-2 stroke-primary' }, fill: gradient });
									}

									LinearGradient($$renderer, {
										class: 'from-primary/50 to-primary/1',
										vertical: true,
										children,
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}