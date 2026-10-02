import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { EllipseState, ellipseMarkInfo } from './Ellipse.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div></div>`);

export default function Ellipse_html($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new EllipseState(() => rest);

	c.chartCtx.registerComponent({
		name: 'Ellipse',
		kind: 'mark',
		markInfo: () => ellipseMarkInfo(rest, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, c.chartCtx.cScale));
				const resolvedStroke = $.derived(() => resolveColorProp($$props.stroke, $.get(item).d, c.chartCtx.cScale));
				const resolvedStrokeWidth = $.derived(() => resolveStyleProp($$props.strokeWidth, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));

				const resolvedBorderWidth = $.derived(() => $.get(resolvedStrokeWidth) != null
					? `${$.get(resolvedStrokeWidth)}px`
					: $.get(resolvedStroke) != null ? '1px' : undefined);

				var div = root();

				$.attribute_effect(
					div,
					($0) => ({
						...rest,
						class: $0,
						[$.STYLE]: {
							position: 'absolute',
							left: `${$.get(item).cx ?? ''}px`,
							top: `${$.get(item).cy ?? ''}px`,
							width: `${$.get(item).rx * 2}px`,
							height: `${$.get(item).ry * 2}px`,
							'border-radius': '50%',
							background: $.get(resolvedFill),
							'background-origin': 'border-box',
							opacity: $.get(resolvedOpacity),
							'border-width': $.get(resolvedBorderWidth),
							'border-color': $.get(resolvedStroke),
							'border-style': 'solid',
							transform: 'translate(-50%, -50%)'
						}
					}),
					[() => cls('lc-ellipse', $.get(resolvedClass))]
				);

				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_1 = root();

			$.attribute_effect(
				div_1,
				($0) => ({
					...rest,
					class: $0,
					[$.STYLE]: {
						position: 'absolute',
						left: `${c.motionCx ?? ''}px`,
						top: `${c.motionCy ?? ''}px`,
						width: `${c.motionRx * 2}px`,
						height: `${c.motionRy * 2}px`,
						'border-radius': '50%',
						background: c.staticFill,
						'background-origin': 'border-box',
						opacity: c.staticOpacity,
						'border-width': c.staticBorderWidth,
						'border-color': c.staticStroke,
						'border-style': 'solid',
						transform: 'translate(-50%, -50%)'
					}
				}),
				[() => cls('lc-ellipse', c.staticClassName)]
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