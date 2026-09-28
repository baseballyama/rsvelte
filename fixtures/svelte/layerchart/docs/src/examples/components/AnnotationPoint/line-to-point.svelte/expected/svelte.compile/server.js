import * as $ from 'svelte/internal/server';
import { AnnotationLine, AnnotationPoint, LineChart, Tooltip, Text } from 'layerchart';
import { format } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Line_to_point($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const annotations = [
			{
				x: new Date('June 29, 2007'),
				y: 121.89,
				label: 'A',
				details: 'iPhone (1st Gen)'
			},

			{
				x: new Date('July 11, 2008'),
				y: 175.16,
				label: 'B',
				details: 'iPhone 3G'
			},

			{
				x: new Date('April 3, 2010'),
				y: 232.39,
				label: 'C',
				details: 'iPad (1st Gen)'
			},

			{
				x: new Date('June 24, 2010'),
				y: 254.28,
				label: 'D',
				details: 'iPhone 4'
			},

			{
				x: new Date('September 1, 2010'),
				y: 258.77,
				label: 'E',
				details: 'Apple TV (2nd Gen)'
			},

			{
				x: new Date('March 11, 2011'),
				y: 352.47,
				label: 'F',
				details: 'iPad (2nd Gen)'
			},

			{
				x: new Date('March 7, 2012'),
				y: 545.18,
				label: 'G',
				details: 'Apple TV (3rd Gen)'
			}
		];

		{
			function aboveMarks($$renderer, { context }) {
				Text($$renderer, {
					x: context.width / 2,
					y: 10,
					textAnchor: 'middle',
					value: 'Apple Stock'
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(annotations);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let annotation = each_array[$$index];

					AnnotationLine($$renderer, {
						x: annotation.x,
						y: annotation.y,
						props: { line: { dashArray: [4, 4], opacity: 0.5 } }
					});

					$$renderer.push(`<!----> `);

					AnnotationPoint($$renderer, {
						x: annotation.x,
						y: annotation.y,
						r: 8,
						label: annotation.label,
						details: annotation.details,
						props: {
							circle: { class: 'fill-secondary' },
							label: { class: 'text-[10px] fill-secondary-content font-bold' }
						}
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
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
				padding: { top: 10, bottom: 20, left: 25 },
				aboveMarks,
				tooltip,
				$$slots: { aboveMarks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}