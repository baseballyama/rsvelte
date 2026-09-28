import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Rect',
	'Circle',
	'Group',
	'shape',
	'r',
	'x',
	'y'
]);

export default function Cell_base($$anchor, $$props) {
	$.push($$props, true);

	let shape = $.prop($$props, 'shape', 3, 'rect'),
		restProps = $.rest_props($$props, rest_excludes);

	const chartCtx = getChartContext();
	const cellWidth = $.derived(() => isScaleBand(chartCtx.xScale) ? chartCtx.xScale.bandwidth() : 0);
	const cellHeight = $.derived(() => isScaleBand(chartCtx.yScale) ? chartCtx.yScale.bandwidth() : 0);
	const defaultR = $.derived(() => Math.min($.get(cellWidth), $.get(cellHeight)) / 2);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(cellWidth) / 2);
				let $1 = $.derived(() => $.get(cellHeight) / 2);

				$.component(node_1, () => $$props.Group, ($$anchor, Group_1) => {
					Group_1($$anchor, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get($1);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								let $0 = $.derived(() => $$props.r ?? $.get(defaultR));

								$.component(node_2, () => $$props.Circle, ($$anchor, Circle_1) => {
									Circle_1($$anchor, $.spread_props(
										{
											get cx() {
												return $$props.x;
											},

											get cy() {
												return $$props.y;
											},

											get r() {
												return $.get($0);
											}
										},
										() => restProps
									));
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.component(node_3, () => $$props.Rect, ($$anchor, Rect_1) => {
				Rect_1($$anchor, $.spread_props(
					{
						get width() {
							return $.get(cellWidth);
						},

						get height() {
							return $.get(cellHeight);
						},

						get x() {
							return $$props.x;
						},

						get y() {
							return $$props.y;
						}
					},
					() => restProps
				));
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (shape() === 'circle') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}