import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { cubicOut } from "svelte/easing";
import { Tween } from "svelte/motion";
import { progressbar } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'progress',
	'precision',
	'tweenDuration',
	'animate',
	'size',
	'labelInside',
	'labelOutside',
	'easing',
	'color',
	'class',
	'classes'
]);

var root = $.from_html(`<div><span> </span> <span> </span></div>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div></div>`);
var root_3 = $.from_html(`<!> <div><!></div>`, 1);

export default function Progressbar($$anchor, $$props) {
	$.push($$props, true);

	let progress = $.prop($$props, 'progress', 3, "45"),
		precision = $.prop($$props, 'precision', 3, 0),
		tweenDuration = $.prop($$props, 'tweenDuration', 3, 400),
		animate = $.prop($$props, 'animate', 3, false),
		size = $.prop($$props, 'size', 3, "h-2.5"),
		labelInside = $.prop($$props, 'labelInside', 3, false),
		labelOutside = $.prop($$props, 'labelOutside', 3, ""),
		easing = $.prop($$props, 'easing', 3, cubicOut),
		color = $.prop($$props, 'color', 3, "primary"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("progressbar"));
	let _progress = $.derived(() => new Tween(0, { duration: animate() ? tweenDuration() : 0, easing: easing() }));

	const $$d = $.derived(() => progressbar({ color: color(), labelInside: labelInside() })),
		base = $.derived(() => $.get($$d).base),
		labelInsideCls = $.derived(() => $.get($$d).label),
		inside = $.derived(() => $.get($$d).inside),
		outside = $.derived(() => $.get($$d).outside),
		span = $.derived(() => $.get($$d).span),
		progressCls = $.derived(() => $.get($$d).progressCls);

	$.user_effect(() => {
		$.get(_progress).set(Number(progress()));
	});

	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
				() => $.get(outside)({ class: clsx($.get(theme)?.outside, $$props.classes?.outside) })
			]);

			var span_1 = $.child(div);
			var text = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_1 = $.only_child(span_2);

			$.reset(div);

			$.template_effect(
				($0, $1) => {
					$.set_class(span_1, 1, $0);
					$.set_text(text, labelOutside());
					$.set_class(span_2, 1, $1);
					$.set_text(text_1, `${progress() ?? ''}%`);
				},
				[
					() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $$props.classes?.span) })),
					() => $.clsx($.get(progressCls)({
						class: clsx($.get(theme)?.progressCls, $$props.classes?.progressCls)
					}))
				]
			);

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (labelOutside()) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.attribute_effect(div_1, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx(size(), $.get(theme)?.base, $$props.class) })
	]);

	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var text_2 = $.only_child(div_2);

			$.template_effect(
				($0, $1) => {
					$.set_class(div_2, 1, $0);
					$.set_style(div_2, `width: ${$.get(_progress).current ?? ''}%`);
					$.set_text(text_2, `${$1 ?? ''}%`);
				},
				[
					() => $.clsx($.get(labelInsideCls)({
						class: clsx(size(), $.get(theme)?.label, $$props.classes?.label)
					})),
					() => $.get(_progress).current.toFixed(precision())
				]
			);

			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_2();

			$.template_effect(
				($0) => {
					$.set_class(div_3, 1, $0);
					$.set_style(div_3, `width: ${$.get(_progress).current ?? ''}%`);
				},
				[
					() => $.clsx($.get(inside)({
						class: clsx(size(), $.get(theme)?.inside, $$props.classes?.label)
					}))
				]
			);

			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if (labelInside()) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.append($$anchor, fragment);
	$.pop();
}