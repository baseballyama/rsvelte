import * as $ from 'svelte/internal/server';
import { Axis, Chart, Highlight, Layer, Points, Rule, Tooltip } from 'layerchart';
import { sort } from '@layerstack/utils';
import { getAlphabet } from '$lib/data.remote';

const alphabetData = await getAlphabet();

export default function Lollipop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = sort(alphabetData, (d) => d.letter);

		Chart($$renderer, {
			data,
			x: 'letter',
			y: 'frequency',
			yNice: true,
			padding: { left: 20, bottom: 32 },
			tooltipContext: { mode: 'band' },
			height: 400,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'left',
							grid: true,
							rule: true,
							format: 'percentRound'
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Rule($$renderer, { class: 'stroke-4 stroke-primary' });
						$$renderer.push(`<!----> `);
						Points($$renderer, { class: 'fill-secondary' });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { area: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.letter });
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
										Tooltip.Item($$renderer, { label: 'Frequency', value: data.frequency, format: 'percent' });
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