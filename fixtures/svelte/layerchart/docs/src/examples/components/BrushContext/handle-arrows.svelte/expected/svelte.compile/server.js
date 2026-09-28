import * as $ from 'svelte/internal/server';
import { Area, Chart, Layer } from 'layerchart';
import { cls } from '@layerstack/tailwind';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Handle_arrows($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Area($$renderer, {
							line: { class: 'stroke-2 stroke-primary' },
							class: 'fill-primary/20'
						});

						$$renderer.push(`<!---->`);

						if (context.brush.active) {
							$$renderer.push(`<!--[0--><rect${$.attr('x', context.brush.range.x)}${$.attr('width', context.brush.handleSize)}${$.attr('height', context.brush.range.height)}${$.attr_class($.clsx(cls('fill-secondary cursor-ew-resize select-none')))}></rect>`);

							LucideChevronLeft($$renderer, {
								x: context.brush.range.x - 6,
								y: context.brush.range.height / 2 - 10,
								class: 'fill-secondary-content'
							});

							$$renderer.push(`<!----><rect${$.attr('x', context.brush.range.x + context.brush.range.width - context.brush.handleSize)}${$.attr('width', context.brush.handleSize)}${$.attr('height', context.brush.range.height)}${$.attr_class($.clsx(cls('fill-secondary cursor-ew-resize select-none')))}></rect>`);

							LucideChevronRight($$renderer, {
								x: context.brush.range.x + context.brush.range.width - context.brush.handleSize - 6,
								y: context.brush.range.height / 2 - 10,
								class: 'fill-secondary-content'
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
				brush: { classes: { range: 'bg-secondary/10' }, handleSize: 8 },
				height: 40,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}