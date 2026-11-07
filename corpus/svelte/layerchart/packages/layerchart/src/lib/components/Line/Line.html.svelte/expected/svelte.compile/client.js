import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { pointsToAngleAndLength } from '$lib/utils/math.js';
import { dashArrayToGradient } from '$lib/utils/path.js';
import { LineState, lineMarkInfo } from './Line.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div></div>`);

export default function Line_html($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new LineState(() => rest);

	c.chartCtx.registerComponent({
		name: 'Line',
		kind: 'mark',
		markInfo: () => lineMarkInfo(rest, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, c.chartCtx.cScale));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));

				const computed_const = $.derived(() => {
					return pointsToAngleAndLength({ x: $.get(item).x1, y: $.get(item).y1 }, { x: $.get(item).x2, y: $.get(item).y2 });
				});

				var div = root();
				let styles;

				$.template_effect(
					($0, $1) => {
						$.set_class(div, 1, $0);

						styles = $.set_style(div, $$props.style, styles, {
							position: 'absolute',
							left: `${$.get(item).x1 ?? ''}px`,
							top: `${$.get(item).y1 ?? ''}px`,
							width: `${$.get(computed_const).length ?? ''}px`,
							height: `${$.get(resolvedStrokeWidth) ?? 1 ?? ''}px`,
							transform: `translateY(-50%) rotate(${$.get(computed_const).angle ?? ''}deg)`,
							'transform-origin': '0 50%',
							opacity: $.get(resolvedOpacity),
							background: $1,
							'background-color': c.dashArrayResolved ? undefined : $.get(resolvedStroke)
						});
					},
					[
						() => $.clsx(cls('lc-line', $.get(resolvedClass))),
						() => c.dashArrayResolved
							? dashArrayToGradient(c.dashArrayResolved, $.get(resolvedStroke) ?? 'var(--stroke-color)')
							: undefined
					]
				);

				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			const computed_const_1 = $.derived(() => {
				return pointsToAngleAndLength({ x: c.motionX1, y: c.motionY1 }, { x: c.motionX2, y: c.motionY2 });
			});

			var div_1 = root();
			let styles_1;

			$.template_effect(
				($0, $1) => {
					$.set_class(div_1, 1, $0);

					styles_1 = $.set_style(div_1, $$props.style, styles_1, {
						position: 'absolute',
						left: `${c.motionX1 ?? ''}px`,
						top: `${c.motionY1 ?? ''}px`,
						width: `${$.get(computed_const_1).length ?? ''}px`,
						height: c.staticHeight,
						transform: `translateY(-50%) rotate(${$.get(computed_const_1).angle ?? ''}deg)`,
						'transform-origin': '0 50%',
						opacity: c.staticOpacity,
						background: $1,
						'background-color': c.dashArrayResolved ? undefined : c.staticStroke
					});
				},
				[
					() => $.clsx(cls('lc-line', c.staticClassName)),
					() => c.dashArrayResolved
						? dashArrayToGradient(c.dashArrayResolved, c.staticStroke ?? 'var(--stroke-color)')
						: undefined
				]
			);

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}