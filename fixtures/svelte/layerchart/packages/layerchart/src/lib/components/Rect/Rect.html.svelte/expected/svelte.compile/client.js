import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { RectState, rectMarkInfo } from './Rect.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'ref']);
var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Rect_html($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	const c = new RectState(() => rest);
	const htmlRest = $.derived(() => rest);

	c.chartCtx.registerComponent({
		name: 'Rect',
		kind: 'mark',
		markInfo: () => rectMarkInfo(rest, c.dataMode)
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
					($0, $1) => ({
						...$.get(htmlRest),
						class: $0,
						[$.STYLE]: {
							position: 'absolute',
							left: `${$.get(item).x ?? ''}px`,
							top: `${$.get(item).y ?? ''}px`,
							width: `${$.get(item).width ?? ''}px`,
							height: `${$.get(item).height ?? ''}px`,
							background: $.get(resolvedFill),
							'background-origin': 'border-box',
							opacity: $.get(resolvedOpacity),
							'border-width': $.get(resolvedBorderWidth),
							'border-style': c.dashArrayResolved ? 'dashed' : 'solid',
							'border-color': $.get(resolvedStroke),
							'border-radius': $1
						}
					}),
					[
						() => cls('lc-rect', $.get(resolvedClass)),
						() => c.borderRadius($.get(item).width, $.get(item).height) ?? `${c.rx}px`
					]
				);

				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_1 = root_1();

			$.attribute_effect(
				div_1,
				($0) => ({
					...$.get(htmlRest),
					class: $0,
					[$.STYLE]: {
						position: 'absolute',
						left: `${c.motionX ?? ''}px`,
						top: `${c.motionY ?? ''}px`,
						width: `${c.motionWidth ?? ''}px`,
						height: `${c.motionHeight ?? ''}px`,
						background: c.staticFill,
						'background-origin': 'border-box',
						opacity: c.staticOpacity,
						'border-width': c.staticBorderWidth,
						'border-style': c.dashArrayResolved ? 'dashed' : 'solid',
						'border-color': c.staticStroke,
						'border-radius': c.borderRadiusStyle ?? `${c.rx}px`
					}
				}),
				[() => cls('lc-rect', c.staticClassName)]
			);

			var node_2 = $.child(div_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}