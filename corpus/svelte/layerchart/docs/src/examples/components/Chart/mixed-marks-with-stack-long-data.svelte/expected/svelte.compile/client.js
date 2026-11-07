import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Bars, Chart, Highlight, Layer, Legend, Spline, Tooltip } from 'layerchart';
import { sum } from 'd3-array';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Mixed_marks_with_stack_long_data($$anchor, $$props) {
	$.push($$props, true);

	// One row per month × fruit, with the category in a column rather than a column per category
	const data = [
		{ month: 'Jan', fruit: 'apples', value: 320 },
		{ month: 'Jan', fruit: 'bananas', value: 180 },
		{ month: 'Jan', fruit: 'cherries', value: 90 },
		{ month: 'Feb', fruit: 'apples', value: 280 },
		{ month: 'Feb', fruit: 'bananas', value: 220 },
		{ month: 'Feb', fruit: 'cherries', value: 120 },
		{ month: 'Mar', fruit: 'apples', value: 410 },
		{ month: 'Mar', fruit: 'bananas', value: 190 },
		{ month: 'Mar', fruit: 'cherries', value: 140 },
		{ month: 'Apr', fruit: 'apples', value: 360 },
		{ month: 'Apr', fruit: 'bananas', value: 260 },
		{ month: 'Apr', fruit: 'cherries', value: 110 },
		{ month: 'May', fruit: 'apples', value: 450 },
		{ month: 'May', fruit: 'bananas', value: 240 },
		{ month: 'May', fruit: 'cherries', value: 160 },
		{ month: 'Jun', fruit: 'apples', value: 520 },
		{ month: 'Jun', fruit: 'bananas', value: 210 },
		{ month: 'Jun', fruit: 'cherries', value: 180 }
	];

	// The target belongs to the month rather than to any fruit, so it's the line's own data
	const targets = [
		{ month: 'Jan', target: 800 },
		{ month: 'Feb', target: 850 },
		{ month: 'Mar', target: 950 },
		{ month: 'Apr', target: 1050 },
		{ month: 'May', target: 1150 },
		{ month: 'Jun', target: 1250 }
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

					Bars(node_3, { radius: 2, rounded: 'edge', strokeWidth: 1 });

					var node_4 = $.sibling(node_3, 2);

					Spline(node_4, {
						get data() {
							return targets;
						},
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
					let hovered = () => ($$arg0?.()).data;
					const rows = $.derived(() => data.filter((d) => d.month === hovered().month));
					var fragment_3 = root_2();
					var node_8 = $.first_child(fragment_3);

					$.component(node_8, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, hovered().month));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_10 = $.first_child(fragment_5);

								$.each(node_10, 17, () => $.get(rows), (row) => row.fruit, ($$anchor, row) => {
									var fragment_6 = $.comment();
									var node_11 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => context().cGet($.get(row)));

										$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
											Tooltip_Item($$anchor, {
												get label() {
													return $.get(row).fruit;
												},

												get value() {
													return $.get(row).value;
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

								var node_12 = $.sibling(node_10, 2);

								$.component(node_12, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
									Tooltip_Separator($$anchor, {});
								});

								var node_13 = $.sibling(node_12, 2);

								{
									let $0 = $.derived(() => sum($.get(rows), (d) => d.value));

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

								{
									let $0 = $.derived(() => targets.find((t) => t.month === hovered().month)?.target);

									$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'target',
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
			y: 'value',
			c: 'fruit',
			cRange: [
				'var(--color-apples)',
				'var(--color-bananas)',
				'var(--color-cherries)'
			],
			bandPadding: 0.3,
			yNice: true,
			padding: { left: 40, bottom: 24, top: 8, right: 8 },
			tooltipContext: { mode: 'band' },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}