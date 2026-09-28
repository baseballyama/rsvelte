import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Highlight, Layer, Tooltip, RectClipPath } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Horizontal_tooltip_and_clipped_highlight($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({
		count: 10,
		min: 20,
		max: 100,
		value: 'integer',
		keys: ['value', 'baseline']
	});

	var $$exports = { data };

	{
		let $0 = $.derived(() => scaleBand().padding(0.4));

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'value',
			xDomain: [0, null],
			xNice: true,
			y: 'date',
			get yScale() {
				return $.get($0);
			},
			padding: { left: 32, bottom: 20, right: 8 },
			tooltipContext: { mode: 'band' },
			class: 'group',
			height: 300,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				Layer(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						Axis(node_1, { placement: 'bottom', grid: true, rule: true });

						var node_2 = $.sibling(node_1, 2);

						Axis(node_2, { placement: 'left', rule: true });

						var node_3 = $.sibling(node_2, 2);

						Bars(node_3, {
							strokeWidth: 1,
							class: 'fill-primary group-hover:fill-gray-300 transition-colors'
						});

						var node_4 = $.sibling(node_3, 2);

						{
							const area = ($$anchor, $$arg0) => {
								let area = () => ($$arg0?.()).area;

								RectClipPath($$anchor, {
									get x() {
										return area().x;
									},

									get y() {
										return area().y;
									},

									get width() {
										return area().width;
									},

									get height() {
										return area().height;
									},
									motion: 'spring',
									children: ($$anchor, $$slotProps) => {
										Bars($$anchor, { strokeWidth: 1, class: 'fill-primary' });
									},
									$$slots: { default: true }
								});
							};

							Highlight(node_4, { area, $$slots: { area: true } });
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node, 2);

				{
					const children = ($$anchor, $$arg0) => {
						let data = () => ($$arg0?.()).data;
						var fragment_5 = root_1();
						var node_6 = $.first_child(fragment_5);

						$.component(node_6, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
							Tooltip_Header($$anchor, {
								get value() {
									return data().date;
								},
								format: 'day'
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Tooltip.List, ($$anchor, Tooltip_List) => {
							Tooltip_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return data().value;
											}
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					};

					$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
						Tooltip_Root($$anchor, { children, $$slots: { default: true } });
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}