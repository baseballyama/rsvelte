import * as $ from 'svelte/internal/server';
import { Chart, Tooltip, Waffle } from 'layerchart';

export default function Basic($$renderer, $$props) {
	const data = [
		{ fruit: 'Apple', count: 212 },
		{ fruit: 'Banana', count: 207 },
		{ fruit: 'Cherry', count: 315 },
		{ fruit: 'Date', count: 11 }
	];

	{
		function marks($$renderer) {
			Waffle($$renderer, { fill: 'var(--color-primary)', tooltip: true });
		}

		function tooltip($$renderer) {
			{
				function children($$renderer, { data }) {
					if (Tooltip.Header) {
						$$renderer.push('<!--[-->');

						Tooltip.Header($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(data.fruit)}`);
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
									Tooltip.Item($$renderer, { label: 'Count', value: data.count, format: 'integer' });
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
			x: 'fruit',
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
}