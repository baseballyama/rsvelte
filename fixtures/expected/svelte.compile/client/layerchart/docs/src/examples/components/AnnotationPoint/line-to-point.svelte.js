import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, AnnotationPoint, LineChart, Tooltip, Text } from 'layerchart';
import { format } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="whitespace-nowrap"> </div>`);

export default function Line_to_point($$anchor, $$props) {
	$.push($$props, true);

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

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => context().width / 2);

				Text(node, {
					get x() {
						return $.get($0);
					},
					y: 10,
					textAnchor: 'middle',
					value: 'Apple Stock'
				});
			}

			var node_1 = $.sibling(node, 2);

			$.each(node_1, 17, () => annotations, $.index, ($$anchor, annotation) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				AnnotationLine(node_2, {
					get x() {
						return $.get(annotation).x;
					},

					get y() {
						return $.get(annotation).y;
					},
					props: { line: { dashArray: [4, 4], opacity: 0.5 } }
				});

				var node_3 = $.sibling(node_2, 2);

				AnnotationPoint(node_3, {
					get x() {
						return $.get(annotation).x;
					},

					get y() {
						return $.get(annotation).y;
					},
					r: 8,
					get label() {
						return $.get(annotation).label;
					},

					get details() {
						return $.get(annotation).details;
					},

					props: {
						circle: { class: 'fill-secondary' },
						label: { class: 'text-[10px] fill-secondary-content font-bold' }
					}
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = $.comment();
			var node_4 = $.first_child(fragment_3);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					{
						var consequent = ($$anchor) => {
							var div = root_1();
							var text = $.only_child(div, true);

							$.template_effect(() => $.set_text(text, data().annotation.details));
							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var fragment_5 = root();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
								Tooltip_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [() => format(context().x(data()), 'daytime')]);
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_8 = $.first_child(fragment_7);

										{
											let $0 = $.derived(() => context().y(data()));

											$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													label: 'value',
													get value() {
														return $.get($0);
													}
												});
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						};

						$.if(node_5, ($$render) => {
							if (data().annotation) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_4);
				};

				$.component(node_4, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { top: 10, bottom: 20, left: 25 },
			aboveMarks,
			tooltip,
			$$slots: { aboveMarks: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}