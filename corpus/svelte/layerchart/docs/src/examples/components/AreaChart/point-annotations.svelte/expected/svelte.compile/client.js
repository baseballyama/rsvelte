import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AreaChart, defaultChartPadding, Tooltip } from 'layerchart';
import { format, sortFunc } from '@layerstack/utils';

const data = await getAppleStock();
var root = $.from_html(`<div class="whitespace-nowrap"> </div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Point_annotations($$anchor, $$props) {
	$.push($$props, true);

	// Get a few random points to use for annotations
	const annotations = $.derived(() => [...data].sort(() => Math.random() - 0.5).slice(0, 5).sort(sortFunc('date')).map((d, i) => ({
		date: d.date,
		label: String.fromCharCode(65 + i),
		details: `This is an annotation for ${format(d.date)}`
	})));

	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var div = root();
							var text = $.only_child(div, true);

							$.template_effect(() => $.set_text(text, data().annotation.details));
							$.append($$anchor, div);
						};

						var alternate = ($$anchor) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
								Tooltip_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [() => format(context().x(data()), 'day')]);
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_4 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => context().y(data()));

											$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													label: 'value',
													get value() {
														return $.get($0);
													}
												});
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (data().annotation) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => $.get(annotations).map((a) => {
			return {
				type: 'point',
				label: a.label,
				details: a.details,
				x: a.date,
				r: 6,
				props: {
					circle: { class: 'fill-secondary' },
					label: { class: 'text-[10px] fill-secondary-content font-bold' }
				}
			};
		}));

		let $1 = $.derived(() => defaultChartPadding({ left: 25 }));

		AreaChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			get annotations() {
				return $.get($0);
			},

			get padding() {
				return $.get($1);
			},
			height: 300,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}