import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { textPlaceholder } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'class',
	'classes'
]);

var root = $.from_html(`<div><div><div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div></div> <span class="sr-only">Loading...</span></div>`);

export default function TextPlaceholder($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "sm"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("textPlaceholder"));

	const $$d = $.derived(() => textPlaceholder({ size: size() })),
		base = $.derived(() => $.get($$d).base),
		div = $.derived(() => $.get($$d).div),
		lineA = $.derived(() => $.get($$d).lineA),
		lineB = $.derived(() => $.get($$d).lineB);

	var div_1 = root();

	$.attribute_effect(div_1, ($0) => ({ role: 'status', ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);

	$.reset(div_2);

	var div_6 = $.sibling(div_2, 2);
	var div_7 = $.child(div_6);
	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.sibling(div_8, 2);

	$.reset(div_6);

	var div_10 = $.sibling(div_6, 2);
	var div_11 = $.child(div_10);
	var div_12 = $.sibling(div_11, 2);
	var div_13 = $.sibling(div_12, 2);

	$.reset(div_10);

	var div_14 = $.sibling(div_10, 2);
	var div_15 = $.child(div_14);
	var div_16 = $.sibling(div_15, 2);
	var div_17 = $.sibling(div_16, 2);

	$.reset(div_14);

	var div_18 = $.sibling(div_14, 2);
	var div_19 = $.child(div_18);
	var div_20 = $.sibling(div_19, 2);
	var div_21 = $.sibling(div_20, 2);

	$.reset(div_18);

	var div_22 = $.sibling(div_18, 2);
	var div_23 = $.child(div_22);
	var div_24 = $.sibling(div_23, 2);
	var div_25 = $.sibling(div_24, 2);

	$.reset(div_22);
	$.next(2);
	$.reset(div_1);

	$.template_effect(
		(
			$0,
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			$12,
			$13,
			$14,
			$15,
			$16,
			$17,
			$18,
			$19,
			$20,
			$21,
			$22,
			$23
		) => {
			$.set_class(div_2, 1, $0);
			$.set_class(div_3, 1, $1);
			$.set_class(div_4, 1, $2);
			$.set_class(div_5, 1, $3);
			$.set_class(div_6, 1, $4);
			$.set_class(div_7, 1, $5);
			$.set_class(div_8, 1, $6);
			$.set_class(div_9, 1, $7);
			$.set_class(div_10, 1, $8);
			$.set_class(div_11, 1, $9);
			$.set_class(div_12, 1, $10);
			$.set_class(div_13, 1, $11);
			$.set_class(div_14, 1, $12);
			$.set_class(div_15, 1, $13);
			$.set_class(div_16, 1, $14);
			$.set_class(div_17, 1, $15);
			$.set_class(div_18, 1, $16);
			$.set_class(div_19, 1, $17);
			$.set_class(div_20, 1, $18);
			$.set_class(div_21, 1, $19);
			$.set_class(div_22, 1, $20);
			$.set_class(div_23, 1, $21);
			$.set_class(div_24, 1, $22);
			$.set_class(div_25, 1, $23);
		},
		[
			() => $.clsx($.get(div)({
				class: clsx("w-full", $.get(theme)?.div, $$props.classes?.div)
			})),

			() => $.clsx($.get(lineA)({
				class: clsx("h-2.5 w-32", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-24", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(div)({
				class: clsx("w-11/12", $.get(theme)?.div, $$props.classes?.div)
			})),

			() => $.clsx($.get(lineA)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-24", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(div)({
				class: clsx("w-9/12", $.get(theme)?.div, $$props.classes?.div)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineA)({
				class: clsx("h-2.5 w-80", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(div)({
				class: clsx("w-11/12", $.get(theme)?.div, $$props.classes?.div)
			})),

			() => $.clsx($.get(lineA)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-24", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(div)({
				class: clsx("w-10/12", $.get(theme)?.div, $$props.classes?.div)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-32", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-24", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineA)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),
			() => $.clsx($.get(div)({ class: clsx("w-8/12", $.get(theme)?.div) })),
			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx($.get(lineA)({
				class: clsx("h-2.5 w-80", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),

			() => $.clsx($.get(lineB)({
				class: clsx("h-2.5 w-full", $.get(theme)?.lineB, $$props.classes?.lineB)
			}))
		]
	);

	$.append($$anchor, div_1);
	$.pop();
}