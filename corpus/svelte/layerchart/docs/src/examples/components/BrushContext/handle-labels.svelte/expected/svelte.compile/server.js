import * as $ from 'svelte/internal/server';
import { Area, Chart, Layer, Text } from 'layerchart';
import { format } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Handle_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});

						$$renderer.push(`<!----> `);

						if (context.brush.active) {
							$$renderer.push('<!--[0-->');

							Text($$renderer, {
								x: context.brush.range.x - 4,
								y: context.brush.range.height / 2,
								value: format(context.brush.x?.[0]),
								textAnchor: 'end',
								verticalAnchor: 'middle',
								class: 'text-xs'
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								x: context.brush.range.x + context.brush.range.width + 4,
								y: context.brush.range.height / 2,
								value: format(context.brush.x?.[1]),
								verticalAnchor: 'middle',
								class: 'text-xs'
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				brush: true,
				height: 40,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}