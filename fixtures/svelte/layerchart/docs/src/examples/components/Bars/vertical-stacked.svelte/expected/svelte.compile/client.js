import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { sum } from 'd3-array';
import { Axis, Bars, Chart, Highlight, Layer, Tooltip, groupStackData } from 'layerchart';
import { longData } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Vertical_stacked($$anchor, $$props) {
	$.push($$props, true);

	const colorKeys = [...new Set(longData.map((x) => x.fruit))];

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	const data = groupStackData(longData, { xKey: 'year', stackBy: 'fruit' });
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					Bars(node_3, { strokeWidth: 1 });

					var node_4 = $.sibling(node_3, 2);

					Highlight(node_4, { area: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = root_2();
					var node_6 = $.first_child(fragment_3);

					$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().year));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_8 = $.first_child(fragment_5);

								$.each(node_8, 17, () => data().data, $.index, ($$anchor, d) => {
									var fragment_6 = $.comment();
									var node_9 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => context().cScale?.($.get(d).fruit));

										$.component(node_9, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												get label() {
													return $.get(d).fruit;
												},

												get value() {
													return $.get(d).value;
												},

												get color() {
													return $.get($0);
												},
												format: 'integer',
												valueAlign: 'right'
											});
										});
									}

									$.append($$anchor, fragment_6);
								});

								var node_10 = $.sibling(node_8, 2);

								$.component(node_10, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_11 = $.sibling(node_10, 2);

								{
									let $0 = $.derived(() => sum([...data().data], (d) => d.value));

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'total',
											get value() {
												return $.get($0);
											},
											format: 'integer',
											valueAlign: 'right'
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

				$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => scaleBand().paddingInner(0.4).paddingOuter(0.2));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'year',
			get xScale() {
				return $.get($0);
			},
			y: 'values',
			yNice: true,
			c: 'fruit',
			get cDomain() {
				return colorKeys;
			},

			get cRange() {
				return keyColors;
			},
			padding: { left: 32, bottom: 20, top: 8 },
			tooltipContext: { mode: 'band' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}