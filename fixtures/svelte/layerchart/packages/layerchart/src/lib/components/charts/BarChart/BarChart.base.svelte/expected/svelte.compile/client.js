import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Chart',
	'Bars',
	'data',
	'x',
	'y',
	'xDomain',
	'radial',
	'orientation',
	'series',
	'seriesLayout',
	'axis',
	'brush',
	'grid',
	'highlight',
	'legend',
	'rule',
	'onBarClick',
	'props',
	'profile',
	'bandPadding',
	'groupPadding',
	'stackPadding',
	'xInterval',
	'yInterval',
	'tooltipContext',
	'marks',
	'context'
]);

export default function BarChart_base($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 19, () => []),
		radial = $.prop($$props, 'radial', 3, false),
		orientation = $.prop($$props, 'orientation', 3, 'vertical'),
		seriesLayout = $.prop($$props, 'seriesLayout', 3, 'auto'),
		axis = $.prop($$props, 'axis', 3, true),
		brush = $.prop($$props, 'brush', 3, false),
		grid = $.prop($$props, 'grid', 3, true),
		highlight = $.prop($$props, 'highlight', 19, () => ({ area: true })),
		legend = $.prop($$props, 'legend', 3, false),
		rule = $.prop($$props, 'rule', 3, true),
		onBarClick = $.prop($$props, 'onBarClick', 3, () => {}),
		props = $.prop($$props, 'props', 19, () => ({})),
		profile = $.prop($$props, 'profile', 3, false),
		bandPadding = $.prop($$props, 'bandPadding', 19, () => radial() ? 0 : 0.4),
		groupPadding = $.prop($$props, 'groupPadding', 3, 0),
		stackPadding = $.prop($$props, 'stackPadding', 3, 0),
		tooltipContext = $.prop($$props, 'tooltipContext', 3, true),
		context = $.prop($$props, 'context', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const valueAxis = $.derived(() => orientation() === 'horizontal' ? 'x' : 'y');

	const series = $.derived(() => $$props.series === undefined
		? [
			{
				key: 'default',
				label: $.get(valueAxis) === 'y'
					? typeof $$props.y === 'string' ? $$props.y : 'value'
					: typeof $$props.x === 'string' ? $$props.x : 'value',
				value: $.get(valueAxis) === 'y' ? $$props.y : $$props.x
			}
		]
		: $$props.series);

	const isGroupSeries = $.derived(() => seriesLayout() === 'group');

	if (profile()) {
		console.time('BarChart render');

		onMount(() => {
			console.timeEnd('BarChart render');
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

						{
							let $0 = $.derived(() => $.get(valueAxis) === 'y' && $.get(isGroupSeries) && $$props.x1 == null ? (d) => $.get(s).value ?? $.get(s).key : undefined);
							let $1 = $.derived(() => $.get(valueAxis) === 'x' && $.get(isGroupSeries) && $$props.y1 == null ? (d) => $.get(s).value ?? $.get(s).key : undefined);

							let $2 = $.derived(() => context().series.stackLayout != null
								? (d) => context().series.isStackTop($.get(s).key, d) ? 'edge' : 'none'
								: Array.isArray($$props.x) || Array.isArray($$props.y) ? 'all' : 'edge');

							$.component(node_3, () => $$props.Bars, ($$anchor, Bars_1) => {
								Bars_1($$anchor, $.spread_props(
									{
										get seriesKey() {
											return $.get(s).key;
										},

										get x1() {
											return $.get($0);
										},

										get y1() {
											return $.get($1);
										},

										get rounded() {
											return $.get($2);
										},
										radius: 4,
										strokeWidth: 1,
										get stackPadding() {
											return stackPadding();
										},
										opacity: (d) => context().series.isHighlighted(context().cKey(d) ?? $.get(s).key, true) ? 1 : 0.1,
										onBarClick: (e, detail) => onBarClick()(e, { ...detail, series: $.get(s) })
									},
									() => props().bars,
									() => $.get(s).props
								));
							});
						}

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

		let $0 = $.derived(() => $.get(valueAxis) === 'y' ? $$props.y : $$props.x);

		let $1 = $.derived(() => tooltipContext() === false
			? false
			: {
				mode: 'band',
				...props().tooltip?.context,
				...typeof tooltipContext() === 'object' ? tooltipContext() : null
			});

		let $2 = $.derived(() => brush()
			? {
				axis: 'x',
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

					get xInterval() {
						return $$props.xInterval;
					},

					get y() {
						return $$props.y;
					},

					get yInterval() {
						return $$props.yInterval;
					},

					get c() {
						return $.get($0);
					},
					cRange: ['var(--color-primary, currentColor)'],
					get radial() {
						return radial();
					},

					get valueAxis() {
						return $.get(valueAxis);
					},

					get bandPadding() {
						return bandPadding();
					},

					get groupPadding() {
						return groupPadding();
					}
				},
				() => restProps,
				{
					get tooltipContext() {
						return $.get($1);
					},

					get brush() {
						return $.get($2);
					},

					get series() {
						return $.get(series);
					},

					get seriesLayout() {
						return seriesLayout();
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

					get legend() {
						return legend();
					},

					get highlight() {
						return highlight();
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