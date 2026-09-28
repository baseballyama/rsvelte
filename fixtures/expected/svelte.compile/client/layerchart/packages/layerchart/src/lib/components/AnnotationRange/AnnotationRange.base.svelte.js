import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getChartContext } from '$lib/contexts/chart.js';
import { isScaleBand } from '$lib/utils/scales.svelte.js';
import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function AnnotationRange_base($$anchor, $$props) {
	$.push($$props, true);

	let labelPlacement = $.prop($$props, 'labelPlacement', 3, 'center'),
		labelXOffset = $.prop($$props, 'labelXOffset', 3, 0),
		labelYOffset = $.prop($$props, 'labelYOffset', 3, 0);

	const ctx = getChartContext();

	const rect = $.derived(() => {
		const x0FromScale = $$props.x?.[0] != null;
		const x1FromScale = $$props.x?.[1] != null;
		const x0 = x0FromScale ? ctx.xScale($$props.x[0]) : ctx.xRange[0];
		const x1 = x1FromScale ? ctx.xScale($$props.x[1]) : ctx.xRange[1];
		const y0 = $$props.y?.[0] != null ? ctx.yScale($$props.y[0]) : ctx.yRange[0];
		const y1 = $$props.y?.[1] != null ? ctx.yScale($$props.y[1]) : ctx.yRange[1];
		const bandPadding = isScaleBand(ctx.xScale) ? ctx.xScale.padding() * ctx.xScale.step() / 2 : 0;
		const bandStep = isScaleBand(ctx.xScale) ? ctx.xScale.step() : 0;
		const leftFromScale = x0 <= x1 ? x0FromScale : x1FromScale;
		const rightFromScale = x0 <= x1 ? x1FromScale : x0FromScale;
		const left = Math.min(x0, x1) - (leftFromScale ? bandPadding : 0);
		const right = Math.max(x0, x1) + (rightFromScale ? bandStep - bandPadding : 0);

		return {
			x: left,
			y: Math.min(y0, y1),
			width: right - left,
			height: Math.abs(y1 - y0)
		};
	});

	const labelProps = $.derived(() => ({
		x: ((labelPlacement().includes('left')
			? $.get(rect).x
			: labelPlacement().includes('right')
				? ($.get(rect).x ?? 0) + $.get(rect).width
				: ($.get(rect).x ?? 0) + $.get(rect).width / 2) ?? 0) + (labelPlacement().includes('right') ? -labelXOffset() : labelXOffset()),

		y: ((labelPlacement().includes('top')
			? $.get(rect).y
			: labelPlacement().includes('bottom')
				? ($.get(rect).y ?? 0) + $.get(rect).height
				: ($.get(rect).y ?? 0) + $.get(rect).height / 2) ?? 0) + (labelPlacement().includes('bottom') ? -labelYOffset() : labelYOffset()),
		dy: -2,
		textAnchor: labelPlacement().includes('left')
			? 'start'
			: labelPlacement().includes('right') ? 'end' : 'middle',

		verticalAnchor: labelPlacement().includes('top')
			? 'start'
			: labelPlacement().includes('bottom') ? 'end' : 'middle'
	}));

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cls('lc-annotation-range', $$props.props?.rect?.class, $$props.class));

				$.component(node_1, () => $$props.Rect, ($$anchor, Rect_1) => {
					Rect_1($$anchor, $.spread_props(() => $.get(rect), () => $$props.props?.rect, {
						get fill() {
							return $$props.fill;
						},

						get class() {
							return $.get($0);
						}
					}));
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.fill || $$props.class) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => $$props.Rect, ($$anchor, Rect_2) => {
						Rect_2($$anchor, $.spread_props(() => $.get(rect), () => $$props.props?.rect, {
							get fill() {
								return gradient();
							}
						}));
					});

					$.append($$anchor, fragment_3);
				};

				$.component(node_3, () => $$props.LinearGradient, ($$anchor, LinearGradient_1) => {
					LinearGradient_1($$anchor, $.spread_props(() => $$props.gradient, { children, $$slots: { default: true } }));
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_2, ($$render) => {
			if ($$props.gradient) $$render(consequent_1);
		});
	}

	var node_5 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_6 = $.first_child(fragment_4);

			{
				const children = ($$anchor, $$arg0) => {
					let pattern = () => ($$arg0?.()).pattern;
					var fragment_5 = $.comment();
					var node_7 = $.first_child(fragment_5);

					$.component(node_7, () => $$props.Rect, ($$anchor, Rect_3) => {
						Rect_3($$anchor, $.spread_props(() => $.get(rect), () => $$props.props?.rect, {
							get fill() {
								return pattern();
							}
						}));
					});

					$.append($$anchor, fragment_5);
				};

				$.component(node_6, () => $$props.Pattern, ($$anchor, Pattern_1) => {
					Pattern_1($$anchor, $.spread_props(() => $$props.pattern, { children, $$slots: { default: true } }));
				});
			}

			$.append($$anchor, fragment_4);
		};

		$.if(node_5, ($$render) => {
			if ($$props.pattern) $$render(consequent_2);
		});
	}

	var node_8 = $.sibling(node_5, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_9 = $.first_child(fragment_6);

			{
				let $0 = $.derived(() => cls('lc-annotation-range-label', $$props.props?.label?.class));

				$.component(node_9, () => $$props.Text, ($$anchor, Text_1) => {
					Text_1($$anchor, $.spread_props(
						{
							get value() {
								return $$props.label;
							}
						},
						() => $.get(labelProps),
						() => $$props.props?.label,
						{
							get class() {
								return $.get($0);
							}
						}
					));
				});
			}

			$.append($$anchor, fragment_6);
		};

		$.if(node_8, ($$render) => {
			if ($$props.label) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}