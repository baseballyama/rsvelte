import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';
import { getAlphabet } from '$lib/data.remote';

const data = await getAlphabet();

export default function Circular_cells($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const scaled = data.slice(0, 18).map((d) => ({ letter: d.letter, count: Math.round(d.frequency * 500) }));

		{
			function marks($$renderer) {
				Waffle($$renderer, {
					fill: 'var(--color-secondary)',
					rx: '100%',
					ry: '100%',
					gap: 2,
					tooltip: true
				});
			}

			function tooltip($$renderer) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.letter)}`);
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

										Tooltip.Item($$renderer, {
											label: 'Frequency',
											value: data.count / 500,
											format: 'percent'
										});

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
				data: scaled,
				x: 'letter',
				bandPadding: 0.2,
				y: 'count',
				yDomain: [0, null],
				yNice: true,
				padding: { left: 32, bottom: 24, top: 8, right: 8 },
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