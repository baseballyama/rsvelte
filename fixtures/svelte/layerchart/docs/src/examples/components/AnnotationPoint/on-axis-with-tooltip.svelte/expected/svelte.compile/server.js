import * as $ from 'svelte/internal/server';
import { AnnotationPoint, Layer, LineChart, Tooltip } from 'layerchart';
import { format, sortFunc } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function On_axis_with_tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Get a few random points to use for annotations
		const annotations = $.derived(() => [...data].sort(() => Math.random() - 0.5).slice(0, 5).sort(sortFunc('date')).map((d, i) => ({
			x: d.date,
			y: d.value,
			label: String.fromCharCode(65 + i),
			details: `This is an annotation for ${format(d.date)}`
		})));

		{
			function aboveContext($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(annotations());

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let annotation = each_array[$$index];

							AnnotationPoint($$renderer, {
								x: annotation.x,
								r: 6,
								label: annotation.label,
								details: annotation.details,
								props: {
									circle: { class: 'fill-secondary' },
									label: { class: 'text-[10px] fill-secondary-content font-bold' }
								}
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (data.annotation) {
							$$renderer.push(`<!--[0--><div class="whitespace-nowrap">${$.escape(data.annotation.details)}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(format(context.x(data), 'daytime'))}`);
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
											Tooltip.Item($$renderer, { label: 'value', value: context.y(data) });
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

						$$renderer.push(`<!--]-->`);
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

			LineChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				height: 300,
				padding: { left: 25, bottom: 15 },
				aboveContext,
				tooltip,
				$$slots: { aboveContext: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}