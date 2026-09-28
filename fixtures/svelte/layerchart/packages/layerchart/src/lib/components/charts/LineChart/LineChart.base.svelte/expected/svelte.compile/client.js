import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { getObjectOrNull } from '$lib/utils/common.js';
import { isScaleTime } from '$lib/utils/scales.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Chart',
	'Spline',
	'data',
	'x',
	'xScale',
	'xDomain',
	'y',
	'yScale',
	'radial',
	'orientation',
	'valueAxis',
	'series',
	'axis',
	'brush',
	'highlight',
	'legend',
	'onPointClick',
	'props',
	'profile',
	'tooltipContext',
	'marks',
	'context'
]);

export default function LineChart_base($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 19, () => []),
		radial = $.prop($$props, 'radial', 3, false),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		axis = $.prop($$props, 'axis', 3, true),
		brush = $.prop($$props, 'brush', 3, false),
		highlight = $.prop($$props, 'highlight', 19, () => ({ lines: true, points: true })),
		legend = $.prop($$props, 'legend', 3, false),
		props = $.prop($$props, 'props', 19, () => ({})),
		profile = $.prop($$props, 'profile', 3, false),
		tooltipContext = $.prop($$props, 'tooltipContext', 3, true),
		context = $.prop($$props, 'context', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const valueAxis = $.derived(() => $$props.valueAxis ?? (orientation() === 'horizontal' ? 'y' : 'x'));

	const series = $.derived(() => $$props.series === undefined
		? [
			{
				key: 'default',
				label: $.get(valueAxis) == 'x'
					? typeof $$props.x === 'string' ? $$props.x : 'value'
					: typeof $$props.y === 'string' ? $$props.y : 'value',
				value: $.get(valueAxis) == 'x' ? $$props.x : $$props.y,
				color: 'var(--color-primary, currentColor)'
			}
		]
		: $$props.series);

	const highlightWithPointClick = $.derived(() => typeof highlight() === 'function'
		? highlight()
		: $$props.onPointClick
			? {
				...getObjectOrNull(highlight()),
				...props().highlight,
				onPointClick: $$props.onPointClick
			}
			: highlight());

	if (profile()) {
		console.time('LineChart render');

		onMount(() => {
			console.timeEnd('LineChart render');
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

						$.component(node_3, () => $$props.Spline, ($$anchor, Spline_1) => {
							Spline_1($$anchor, $.spread_props(
								{
									get seriesKey() {
										return $.get(s).key;
									}
								},
								() => props().spline
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

		let $0 = $.derived(() => $$props.x ?? ($.get(valueAxis) === 'x'
			? $.get(series).map((s) => s.value ?? s.key)
			: undefined));

		let $1 = $.derived(() => $.get(valueAxis) === 'y' || $$props.xScale && isScaleTime($$props.xScale) ? undefined : 0);

		let $2 = $.derived(() => $$props.y ?? ($.get(valueAxis) === 'y'
			? $.get(series).map((s) => s.value ?? s.key)
			: undefined));

		let $3 = $.derived(() => $.get(valueAxis) === 'x' || $$props.yScale && isScaleTime($$props.yScale) ? undefined : 0);

		let $4 = $.derived(() => tooltipContext() === false
			? false
			: {
				mode: $.get(valueAxis) === 'x' ? 'quadtree-y' : 'quadtree-x',
				...props().tooltip?.context,
				...typeof tooltipContext() === 'object' ? tooltipContext() : null
			});

		let $5 = $.derived(() => brush()
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

					get xScale() {
						return $$props.xScale;
					},

					get x() {
						return $.get($0);
					},

					get xDomain() {
						return $$props.xDomain;
					},

					get xBaseline() {
						return $.get($1);
					},

					get yScale() {
						return $$props.yScale;
					},

					get y() {
						return $.get($2);
					},

					get yBaseline() {
						return $.get($3);
					},

					get radial() {
						return radial();
					},

					get valueAxis() {
						return $.get(valueAxis);
					},

					get axis() {
						return axis();
					}
				},
				() => restProps,
				{
					get tooltipContext() {
						return $.get($4);
					},

					get brush() {
						return $.get($5);
					},

					get series() {
						return $.get(series);
					},

					get highlight() {
						return $.get(highlightWithPointClick);
					},

					get legend() {
						return legend();
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