import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Multiple_series_using_overrides($$anchor, $$props) {
	$.push($$props, true);

	const data = Array.from({ length: 90 }).map((_, i) => ({
		x: i,
		y: Math.floor(Math.random() * 90),
		y1: Math.floor(Math.random() * 90)
	}));

	const fruitColors = {
		bananas: 'var(--color-success)',
		oranges: 'var(--color-warning)'
	};

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'x',
		y: 'y',
		yDomain: [0, null],
		yNice: true,
		padding: 25,
		tooltipContext: { mode: 'quadtree-x' },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Axis(node_1, { placement: 'left', grid: true, rule: true });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'bottom', rule: true });

					var node_3 = $.sibling(node_2, 2);

					Spline(node_3, {
						y: (d) => d.y,
						class: 'stroke-2',
						get stroke() {
							return fruitColors.bananas;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					Spline(node_4, {
						y: (d) => d.y1,
						class: 'stroke-2',
						get stroke() {
							return fruitColors.oranges;
						}
					});

					var node_5 = $.sibling(node_4, 2);

					{
						let $0 = $.derived(() => ({ fill: fruitColors.bananas }));

						Highlight(node_5, {
							y: (d) => d.y,
							get points() {
								return $.get($0);
							}
						});
					}

					var node_6 = $.sibling(node_5, 2);

					{
						let $0 = $.derived(() => ({ fill: fruitColors.oranges }));

						Highlight(node_6, {
							y: (d) => d.y1,
							get points() {
								return $.get($0);
							}
						});
					}

					var node_7 = $.sibling(node_6, 2);

					Highlight(node_7, { lines: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_3 = $.comment();
					var node_9 = $.first_child(fragment_3);

					$.component(node_9, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();
								var node_10 = $.first_child(fragment_4);

								$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'bananas',
										get value() {
											return data().y;
										}
									});
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'oranges',
										get value() {
											return data().y1;
										}
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_8, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}