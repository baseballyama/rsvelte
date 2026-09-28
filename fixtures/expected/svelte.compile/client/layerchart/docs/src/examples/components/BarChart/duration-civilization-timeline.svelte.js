import 'svelte/internal/disclose-version';
import { getCivilizationEvents } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { BarChart, Tooltip } from 'layerchart';

const data = await getCivilizationEvents();
var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Duration_civilization_timeline($$anchor, $$props) {
	$.push($$props, true);

	function formatYear(number) {
		return Math.sign(number) === -1 ? Math.abs(number) + ' BC' : number + ' AD';
	}

	var $$exports = { data };

	{
		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().civilization));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'region',
										get value() {
											return data().region;
										}
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'timeline',
										get value() {
											return data().timeline;
										}
									});
								});

								var node_5 = $.sibling(node_4, 2);

								$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'start',
										get value() {
											return data().start;
										},
										format: formatYear
									});
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'end',
										get value() {
											return data().end;
										},
										format: formatYear
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		BarChart($$anchor, {
			get data() {
				return data;
			},
			x: ['start', 'end'],
			y: 'civilization',
			c: 'region',
			cRange: [
				'var(--color-danger)',
				'var(--color-warning)',
				'var(--color-success)',
				'var(--color-info)'
			],
			rule: false,
			orientation: 'horizontal',
			padding: { left: 200, bottom: 36, right: 36 },
			props: {
				xAxis: { format: formatYear },
				yAxis: {
					tickLabelProps: { width: 300, truncate: { position: 'middle' } }
				}
			},
			height: 700,
			tooltip,
			$$slots: { tooltip: true }
		});
	}

	return $.pop($$exports);
}