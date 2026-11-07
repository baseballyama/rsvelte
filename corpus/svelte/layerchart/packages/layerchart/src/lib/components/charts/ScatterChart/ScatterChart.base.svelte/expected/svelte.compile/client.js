import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { chartDataArray } from '$lib/utils/common.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Chart',
	'Points',
	'data',
	'x',
	'y',
	'xDomain',
	'yDomain',
	'series',
	'axis',
	'brush',
	'grid',
	'rule',
	'highlight',
	'legend',
	'props',
	'profile',
	'tooltipContext',
	'marks',
	'tooltip',
	'context'
]);

export default function ScatterChart_base($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 19, () => []),
		axis = $.prop($$props, 'axis', 3, true),
		brush = $.prop($$props, 'brush', 3, false),
		grid = $.prop($$props, 'grid', 19, () => ({ x: true, y: true })),
		rule = $.prop($$props, 'rule', 19, () => ({ x: 0, y: 0 })),
		highlight = $.prop($$props, 'highlight', 19, () => ({ lines: true, points: true, axis: 'both' })),
		legend = $.prop($$props, 'legend', 3, false),
		props = $.prop($$props, 'props', 19, () => ({})),
		profile = $.prop($$props, 'profile', 3, false),
		tooltipContext = $.prop($$props, 'tooltipContext', 3, true),
		context = $.prop($$props, 'context', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const series = $.derived(() => $$props.series === undefined
		? [{ key: 'default', data: chartDataArray(data()) }]
		: $$props.series);

	if (profile()) {
		console.time('ScatterChart render');

		onMount(() => {
			console.timeEnd('ScatterChart render');
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const marks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					$$props.marks($$anchor, () => ({ context: context() }));
				};

				var alternate = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.each(node_2, 19, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => $$props.Points, ($$anchor, Points_1) => {
							Points_1($$anchor, $.spread_props(
								{
									get seriesKey() {
										return $.get(s).key;
									}
								},
								() => props().points
							));
						});

						$.append($$anchor, fragment_4);
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if (typeof $$props.marks === 'function') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => tooltipContext() === false
			? false
			: {
				mode: 'quadtree',
				...props().tooltip?.context,
				...typeof tooltipContext() === 'object' ? tooltipContext() : null
			});

		let $1 = $.derived(() => brush()
			? {
				axis: 'both',
				zoomOnBrush: true,
				...typeof brush() === 'object' ? brush() : null,
				...props().brush
			}
			: false);

		$.component(node, () => $$props.Chart, ($$anchor, Chart_1) => {
			Chart_1($$anchor, $.spread_props(
				{
					get data() {
						return data();
					},

					get x() {
						return $$props.x;
					},

					get xDomain() {
						return $$props.xDomain;
					},

					get y() {
						return $$props.y;
					},

					get yDomain() {
						return $$props.yDomain;
					},

					get c() {
						return $$props.y;
					},
					cRange: ['var(--color-primary, currentColor)']
				},
				() => restProps,
				{
					get tooltipContext() {
						return $.get($0);
					},

					get brush() {
						return $.get($1);
					},

					get series() {
						return $.get(series);
					},

					get axis() {
						return axis();
					},

					get grid() {
						return grid();
					},

					get rule() {
						return rule();
					},

					get highlight() {
						return highlight();
					},

					get legend() {
						return legend();
					},

					get tooltip() {
						return $$props.tooltip;
					},

					get props() {
						return props();
					},

					get context() {
						return context();
					},

					set context($$value) {
						context($$value);
					},
					marks,
					$$slots: { marks: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}