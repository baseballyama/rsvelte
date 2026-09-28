import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Bars, Chart, Highlight, Layer, Legend, Spline, Tooltip } from 'layerchart';
import { sum } from 'd3-array';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Mixed_marks_with_stack($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			month: 'Jan',
			apples: 320,
			bananas: 180,
			cherries: 90,
			target: 800
		},

		{
			month: 'Feb',
			apples: 280,
			bananas: 220,
			cherries: 120,
			target: 850
		},

		{
			month: 'Mar',
			apples: 410,
			bananas: 190,
			cherries: 140,
			target: 950
		},

		{
			month: 'Apr',
			apples: 360,
			bananas: 260,
			cherries: 110,
			target: 1050
		},

		{
			month: 'May',
			apples: 450,
			bananas: 240,
			cherries: 160,
			target: 1150
		},

		{
			month: 'Jun',
			apples: 520,
			bananas: 210,
			cherries: 180,
			target: 1250
		}
	];

	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true, format: 'metric' });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					$.each(node_3, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
						Bars($$anchor, {
							get seriesKey() {
								return $.get(s).key;
							},
							radius: 2,
							rounded: 'edge',
							strokeWidth: 1
						});
					});

					var node_4 = $.sibling(node_3, 2);

					Spline(node_4, {
						y: 'target',
						stroke: 'var(--color-surface-content)',
						class: 'stroke-2 [stroke-dasharray:4_3]'
					});

					var node_5 = $.sibling(node_4, 2);

					Highlight(node_5, { area: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node, 2);

			Legend(node_6, { placement: 'top-right' });

			var node_7 = $.sibling(node_6, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_4 = root_2();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, data().month));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_10 = $.first_child(fragment_6);

								$.each(node_10, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
									var fragment_7 = $.comment();
									var node_11 = $.first_child(fragment_7);

									$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											get label() {
												return $.get(s).key;
											},

											get value() {
												return data()[$.get(s).key];
											},

											get color() {
												return $.get(s).color;
											},
											format: 'integer',
											valueAlign: 'right'
										});
									});

									$.append($$anchor, fragment_7);
								});

								var node_12 = $.sibling(node_10, 2);

								$.component(node_12, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_13 = $.sibling(node_12, 2);

								{
									let $0 = $.derived(() => sum(context().series.visibleSeries, (s) => data()[s.key]));

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
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

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'target',
										get value() {
											return data().target;
										},
										format: 'integer',
										valueAlign: 'right'
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.component(node_7, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'month',
			series: [
				{ key: 'apples', color: 'var(--color-apples)' },
				{ key: 'bananas', color: 'var(--color-bananas)' },
				{ key: 'cherries', color: 'var(--color-cherries)' }
			],
			bandPadding: 0.3,
			yNice: true,
			padding: { left: 40, bottom: 24, top: 20, right: 8 },
			tooltipContext: { mode: 'band' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}