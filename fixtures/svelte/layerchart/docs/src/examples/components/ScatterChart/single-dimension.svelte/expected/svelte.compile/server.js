import * as $ from 'svelte/internal/server';
import { ScatterChart, Tooltip } from 'layerchart';
import { randomNormal } from 'd3-random';
import { format } from '@layerstack/utils';

export default function Single_dimension($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const random = randomNormal();
		const data = Array.from({ length: 100 }, () => ({ value: random() }));

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(format(context.x(data)))}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');

						Tooltip.Root($$renderer, {
							x: 'data',
							y: 'data',
							yOffset: 12,
							anchor: 'top',
							children,
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			ScatterChart($$renderer, {
				data,
				x: 'value',
				y: (d) => 0,
				axis: false,
				grid: false,
				props: { points: { opacity: 0.3 }, highlight: { lines: false } },
				height: 24,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}