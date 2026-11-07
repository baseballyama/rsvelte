import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getObjectOrNull } from '$lib/utils/common.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Chart',
	'Area',
	'data',
	'y',
	'xDomain',
	'radial',
	'series',
	'seriesLayout',
	'axis',
	'brush',
	'grid',
	'legend',
	'tooltipContext',
	'highlight',
	'rule',
	'onPointClick',
	'props',
	'profile',
	'marks',
	'tooltip',
	'context'
]);

export default function AreaChart_base($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 19, () => []),
		radial = $.prop($$props, 'radial', 3, false),
		seriesLayout = $.prop($$props, 'seriesLayout', 3, 'auto'),
		axis = $.prop($$props, 'axis', 3, true),
		brush = $.prop($$props, 'brush', 3, false),
		grid = $.prop($$props, 'grid', 3, true),
		legend = $.prop($$props, 'legend', 3, false),
		tooltipContext = $.prop($$props, 'tooltipContext', 3, true),
		highlight = $.prop($$props, 'highlight', 19, () => ({ lines: true, points: true })),
		rule = $.prop($$props, 'rule', 3, true),
		props = $.prop($$props, 'props', 19, () => ({})),
		profile = $.prop($$props, 'profile', 3, false),
		context = $.prop($$props, 'context', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const series = $.derived(() => $$props.series === undefined
		? [
			{
				key: 'default',
				label: typeof $$props.y === 'string' ? $$props.y : 'value',
				value: $$props.y,
				color: 'var(--color-primary, currentColor)'
			}
		]
		: $$props.series);

	if (profile()) {
		console.time('AreaChart render');

		onMount(() => {
			console.timeEnd('AreaChart render');
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

					$.each(node_2, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						{
							let $0 = $.derived(() => ({
								...props().line,
								...getObjectOrNull(props().area?.line),
								...getObjectOrNull($.get(s).props?.line)
							}));

							$.component(node_3, () => $$props.Area, ($$anchor, Area_1) => {
								Area_1($$anchor, $.spread_props(
									{
										get seriesKey() {
											return $.get(s).key;
										},
										fillOpacity: 0.3,
										get line() {
											return $.get($0);
										}
									},
									() => props().area,
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

		let $0 = $.derived(() => tooltipContext() === false
			? false
			: {
				mode: 'quadtree-x',
				...props().tooltip?.context,
				...typeof tooltipContext() === 'object' ? tooltipContext() : null
			});

		let $1 = $.derived(() => brush()
			? {
				axis: 'x',
				zoomOnBrush: true,
				...typeof brush() === 'object' ? brush() : null,
				...props().brush
			}
			: false);

		let $2 = $.derived(() => ({
			...props(),
			highlight: { ...props().highlight, onPointClick: $$props.onPointClick }
		}));

		$.component(node, () => $$props.Chart, ($$anchor, Chart_1) => {
			Chart_1($$anchor, $.spread_props(
				{
					get data() {
						return data();
					},

					get xDomain() {
						return $$props.xDomain;
					},

					get y() {
						return $$props.y;
					},
					yBaseline: 0,
					yNice: true,
					get radial() {
						return radial();
					}
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

					get tooltip() {
						return $$props.tooltip;
					},

					get props() {
						return $.get($2);
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