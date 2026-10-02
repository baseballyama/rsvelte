import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { progressradial } from "./theme";
import clsx from "clsx";
import { cubicOut } from "svelte/easing";
import { Tween } from "svelte/motion";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'progress',
	'radius',
	'startingPosition',
	'precision',
	'tweenDuration',
	'animate',
	'size',
	'thickness',
	'labelInside',
	'labelOutside',
	'easing',
	'color',
	'class',
	'classes'
]);

var root = $.from_html(`<div><span> </span> <span> </span></div>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<div class="flex flex-col items-center"><!> <div><svg viewBox="0 0 100 100" class="h-full w-full"><circle cx="50" cy="50" fill="none"></circle><circle cx="50" cy="50" fill="none" stroke-linecap="round"></circle></svg> <!></div></div>`);

export default function Progressradial($$anchor, $$props) {
	$.push($$props, true);

	let progress = $.prop($$props, 'progress', 3, 45),
		radius = $.prop($$props, 'radius', 3, 42),
		startingPosition = $.prop($$props, 'startingPosition', 3, "top"),
		precision = $.prop($$props, 'precision', 3, 0),
		tweenDuration = $.prop($$props, 'tweenDuration', 3, 400),
		animate = $.prop($$props, 'animate', 3, false),
		size = $.prop($$props, 'size', 3, "h-24 w-24"),
		thickness = $.prop($$props, 'thickness', 3, 4),
		labelInside = $.prop($$props, 'labelInside', 3, false),
		labelOutside = $.prop($$props, 'labelOutside', 3, ""),
		easing = $.prop($$props, 'easing', 3, cubicOut),
		color = $.prop($$props, 'color', 3, "primary"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("progressradial"));
	const _progress = $.derived(() => new Tween(0, { duration: animate() ? tweenDuration() : 0, easing: easing() }));

	const $$d = $.derived(() => progressradial({ color: color(), labelInside: labelInside() })),
		base = $.derived(() => $.get($$d).base),
		label = $.derived(() => $.get($$d).label),
		background = $.derived(() => $.get($$d).background),
		foreground = $.derived(() => $.get($$d).foreground),
		outside = $.derived(() => $.get($$d).outside),
		span = $.derived(() => $.get($$d).span),
		progressCls = $.derived(() => $.get($$d).progressCls);

	$.user_effect(() => {
		$.get(_progress).set(Number(progress()));
	});

	// Calculate the circle properties
	let circumference = $.derived(() => 2 * Math.PI * radius());

	// let strokeDashoffset = $state()
	// Calculate the stroke-dashoffset based on progress
	let strokeDashoffset = $.derived(() => $.get(circumference) - $.get(_progress).current / 100 * $.get(circumference));

	let rotationAngle = $.derived(() => startingPosition() === "top"
		? -90
		: startingPosition() === "right"
			? 0
			: startingPosition() === "bottom" ? 90 : startingPosition() === "left" ? 180 : -90);

	let formattedProgress = $.derived(() => $.get(_progress).current.toFixed(precision()));
	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var span_1 = $.child(div_1);
			var text = $.only_child(span_1, true);
			var span_2 = $.sibling(span_1, 2);
			var text_1 = $.only_child(span_2);

			$.reset(div_1);

			$.template_effect(
				($0, $1, $2) => {
					$.set_class(div_1, 1, $0);
					$.set_class(span_1, 1, $1);
					$.set_text(text, labelOutside());
					$.set_class(span_2, 1, $2);
					$.set_text(text_1, `${$.get(formattedProgress) ?? ''}%`);
				},
				[
					() => $.clsx($.get(outside)({ class: clsx($.get(theme)?.outside, $$props.classes?.outside) })),
					() => $.clsx($.get(span)({ class: clsx($.get(theme)?.span, $$props.classes?.span) })),
					() => $.clsx($.get(progressCls)({
						class: clsx($.get(theme)?.progressCls, $$props.classes?.progressCls)
					}))
				]
			);

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (labelOutside()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);

	$.attribute_effect(div_2, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx(size(), $.get(theme)?.base, $$props.class) })
	]);

	var svg = $.child(div_2);
	var circle = $.child(svg);
	var circle_1 = $.sibling(circle);

	$.reset(svg);

	var node_1 = $.sibling(svg, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();
			var text_2 = $.only_child(div_3);

			$.template_effect(
				($0) => {
					$.set_class(div_3, 1, $0);
					$.set_text(text_2, `${$.get(formattedProgress) ?? ''}%`);
				},
				[
					() => $.clsx($.get(label)({ class: clsx($.get(theme)?.label, $$props.classes?.label) }))
				]
			);

			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if (labelInside()) $$render(consequent_1);
		});
	}

	$.reset(div_2);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_style(svg, `transform: rotate(${$.get(rotationAngle) ?? ''}deg)`);
			$.set_attribute(circle, 'r', radius());
			$.set_class(circle, 0, $0);
			$.set_attribute(circle, 'stroke-width', thickness());
			$.set_attribute(circle_1, 'r', radius());
			$.set_class(circle_1, 0, $1);
			$.set_attribute(circle_1, 'stroke-width', thickness());
			$.set_attribute(circle_1, 'stroke-dasharray', $.get(circumference));
			$.set_attribute(circle_1, 'stroke-dashoffset', $.get(strokeDashoffset));
		},
		[
			() => $.clsx($.get(background)({
				class: clsx($.get(theme)?.background, $$props.classes?.background)
			})),

			() => $.clsx($.get(foreground)({
				class: clsx($.get(theme)?.foreground, $$props.classes?.foreground)
			}))
		]
	);

	$.append($$anchor, div);
	$.pop();
}