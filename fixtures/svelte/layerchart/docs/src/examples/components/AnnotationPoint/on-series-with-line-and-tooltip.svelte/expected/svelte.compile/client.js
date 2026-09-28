import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, AnnotationPoint, Layer, LineChart, Tooltip } from 'layerchart';
import { format, sortFunc } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="whitespace-nowrap"> </div>`);

export default function On_series_with_line_and_tooltip($$anchor, $$props) {
	$.push($$props, true);

	// Get a few random points to use for annotations
	const annotations = $.derived(() => [...data].sort(() => Math.random() - 0.5).slice(0, 5).sort(sortFunc('date')).map((d, i) => ({
		x: d.date,
		y: d.value,
		label: String.fromCharCode(65 + i),
		details: `This is an annotation for ${format(d.date)}`
	})));

	var $$exports = { data };

	{
		const aboveContext = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => $.get(annotations), $.index, ($$anchor, annotation) => {
						var fragment_3 = root();
						var node_1 = $.first_child(fragment_3);

						AnnotationLine(node_1, {
							get x() {
								return $.get(annotation).x;
							},

							get y() {
								return $.get(annotation).y;
							},
							r: 6,
							props: { line: { dashArray: [4, 4], opacity: 0.5 } }
						});

						var node_2 = $.sibling(node_1, 2);

						AnnotationPoint(node_2, {
							get x() {
								return $.get(annotation).x;
							},

							get y() {
								return $.get(annotation).y;
							},
							r: 6,
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

						$.append($$anchor, fragment_3);
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_4 = $.comment();
			var node_3 = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					{
						var consequent = ($$anchor) => {
							var div = root_1();
							var text = $.only_child(div, true);

							$.template_effect(() => $.set_text(text, data().annotation.details));
							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var fragment_6 = root();
							var node_5 = $.first_child(fragment_6);

							$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
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

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_7 = $.first_child(fragment_8);

										{
											let $0 = $.derived(() => context().y(data()));

											$.component(node_7, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													label: 'value',
													get value() {
														return $.get($0);
													}
												});
											});
										}

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_4, ($$render) => {
							if (data().annotation) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_5);
				};

				$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_4);
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { left: 25, bottom: 15 },
			aboveContext,
			tooltip,
			$$slots: { aboveContext: true, tooltip: true }
		});
	}

	return $.pop($$exports);
}