import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { rollup } from 'd3-array';
import { getOlympians } from '$lib/data.remote';

const olympians = await getOlympians();

export default function Olympians_by_sex($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = Array.from(rollup(olympians, (v) => v.length, (d) => d.sex), ([sex, count]) => ({ sex, count })).sort((a, b) => b.count - a.count);

		{
			function marks($$renderer) {
				Waffle($$renderer, { fill: 'var(--color-primary)', unit: 10, tooltip: true });
			}

			function tooltip($$renderer) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.sex)}`);
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
										Tooltip.Item($$renderer, { label: 'Athletes', value: data.count, format: 'integer' });
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
			}

			Chart($$renderer, {
				data,
				x: 'sex',
				bandPadding: 0.2,
				y: 'count',
				yDomain: [0, null],
				yNice: true,
				padding: { left: 36, bottom: 24, top: 8, right: 8 },
				height: 400,
				rule: true,
				grid: true,
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}