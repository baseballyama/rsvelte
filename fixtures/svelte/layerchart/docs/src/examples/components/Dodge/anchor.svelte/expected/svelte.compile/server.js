import * as $ from 'svelte/internal/server';
import { Chart, Circle, Dodge, Text } from 'layerchart';
import { getOlympians } from '$lib/data.remote';

const olympians = await getOlympians();

export default function Anchor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = olympians.filter((d) => d.weight != null).slice(0, 200);
		const anchors = ['top', 'middle', 'bottom'];

		$$renderer.push(`<div class="grid grid-cols-1 gap-4"><!--[-->`);

		const each_array = $.ensure_array_like(anchors);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let anchor = each_array[$$index_1];

			$$renderer.push(`<div>`);

			{
				function marks($$renderer, { context }) {
					Text($$renderer, {
						x: 8,
						y: 8,
						value: `anchor: ${$.stringify(anchor)}`,
						textAnchor: 'start',
						verticalAnchor: 'start',
						class: 'text-[10px] fill-surface-content/60'
					});

					$$renderer.push(`<!----> `);

					{
						function children($$renderer, { items: dodged }) {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(dodged);

							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
								let { x, y, r, index } = each_array_1[$$index];

								Circle($$renderer, {
									cx: x,
									cy: y,
									r,
									class: 'fill-info opacity-70',
									onpointermove: (e) => context.tooltip.show(e, data[index]),
									onpointerleave: context.tooltip.hide
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						Dodge($$renderer, {
							axis: 'y',
							anchor,
							r: 3,
							padding: 1,
							children,
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!---->`);
				}

				Chart($$renderer, {
					data,
					x: 'weight',
					xNice: true,
					padding: { top: 24, bottom: 24, left: 12, right: 12 },
					height: 160,
					axis: 'x',
					marks,
					$$slots: { marks: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { data });
	});
}