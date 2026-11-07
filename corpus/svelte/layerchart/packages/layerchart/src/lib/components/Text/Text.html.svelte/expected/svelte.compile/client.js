import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
import { getPixelValue, TextState, textMarkInfo } from './Text.shared.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Text_html($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const c = new TextState(() => rest);

	c.chartCtx.registerComponent({
		name: 'Text',
		kind: 'mark',
		markInfo: () => textMarkInfo(rest, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const text = $.derived(() => c.resolveTextValue($.get(item).d));
				const resolvedFill = $.derived(() => resolveColorProp($$props.fill, $.get(item).d, c.chartCtx.cScale));
				const resolvedFillOpacity = $.derived(() => resolveStyleProp($$props.fillOpacity, $.get(item).d));
				const resolvedOpacity = $.derived(() => resolveStyleProp($$props.opacity, $.get(item).d));
				const resolvedClass = $.derived(() => resolveStyleProp($$props.class, $.get(item).d));
				const textAnchor = $.derived(() => $$props.textAnchor ?? 'start');
				const verticalAnchor = $.derived(() => $$props.verticalAnchor ?? 'end');
				const translateX = $.derived(() => $.get(textAnchor) === 'middle' ? '-50%' : $.get(textAnchor) === 'end' ? '-100%' : '0%');

				const translateY = $.derived(() => $.get(verticalAnchor) === 'middle'
					? '-50%'
					: $.get(verticalAnchor) === 'end' ? '-100%' : '0%');

				var div = root();
				let styles;
				var text_1 = $.only_child(div, true);

				$.template_effect(
					($0, $1) => {
						$.set_class(div, 1, $.clsx(['lc-text', $.get(resolvedClass)]));

						styles = $.set_style(div, '', styles, {
							position: 'absolute',
							left: $0,
							top: $1,
							transform: `translate(${$.get(translateX) ?? ''}, ${$.get(translateY) ?? ''}) rotate(${$$props.rotate ?? 0 ?? ''}deg)`,
							'transform-origin': `${$.get(verticalAnchor) === 'middle'
								? 'center'
								: $.get(verticalAnchor) === 'end' ? 'bottom' : 'top'}
      ${$.get(textAnchor) === 'middle'
								? 'center'
								: $.get(textAnchor) === 'end' ? 'right' : 'left'}`,
							'white-space': 'pre-wrap',
							'line-height': $$props.lineHeight ?? '1em',
							'font-size': typeof $$props.fontSize === 'number' ? `${$$props.fontSize}px` : $$props.fontSize,
							color: $.get(resolvedFill),
							opacity: $.get(resolvedOpacity) ?? $.get(resolvedFillOpacity)
						});

						$.set_text(text_1, $.get(text));
					},
					[
						() => `${getPixelValue($$props.dx ?? 0) + $.get(item).x}px`,
						() => `${getPixelValue($$props.dy ?? 0) + $.get(item).y}px`
					]
				);

				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			const textAnchor = $.derived(() => $$props.textAnchor ?? 'start');
			const verticalAnchor = $.derived(() => $$props.verticalAnchor ?? 'end');
			const translateX = $.derived(() => $.get(textAnchor) === 'middle' ? '-50%' : $.get(textAnchor) === 'end' ? '-100%' : '0%');

			const translateY = $.derived(() => $.get(verticalAnchor) === 'middle'
				? '-50%'
				: $.get(verticalAnchor) === 'end' ? '-100%' : '0%');

			var div_1 = root_2();
			let styles_1;
			var node_2 = $.child(div_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(node_3, 17, () => $$props.segments, $.index, ($$anchor, segment) => {
						var span = root_1();
						var text_2 = $.only_child(span, true);

						$.template_effect(() => {
							$.set_class(span, 1, $.clsx($.get(segment).class));
							$.set_text(text_2, $.get(segment).value);
						});

						$.append($$anchor, span);
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, c.textValue));
					$.append($$anchor, text_3);
				};

				$.if(node_2, ($$render) => {
					if ($$props.segments) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(div_1);

			$.template_effect(() => {
				$.set_class(div_1, 1, $.clsx(['lc-text', c.staticClassName]));

				styles_1 = $.set_style(div_1, '', styles_1, {
					position: 'absolute',
					left: `${(typeof $$props.dx === 'number' ? $$props.dx : 0) + (typeof c.motionX === 'number' ? c.motionX : 0)}px`,
					top: `${(typeof $$props.dy === 'number' ? $$props.dy : 0) + (typeof c.motionY === 'number' ? c.motionY : 0)}px`,
					transform: `translate(${$.get(translateX) ?? ''}, ${$.get(translateY) ?? ''}) rotate(${$$props.rotate ?? 0 ?? ''}deg)`,
					'transform-origin': `${$.get(verticalAnchor) === 'middle'
						? 'center'
						: $.get(verticalAnchor) === 'end' ? 'bottom' : 'top'}
    ${$.get(textAnchor) === 'middle'
						? 'center'
						: $.get(textAnchor) === 'end' ? 'right' : 'left'}`,
					'white-space': 'pre-wrap',
					'line-height': $$props.lineHeight ?? '1em',
					'font-size': typeof $$props.fontSize === 'number' ? `${$$props.fontSize}px` : $$props.fontSize,
					color: c.staticFill,
					opacity: c.staticOpacity ?? c.staticFillOpacity
				});
			});

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}