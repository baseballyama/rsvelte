import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { skeleton } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'class',
	'classes'
]);

var root = $.from_html(`<div><div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <span class="sr-only">Loading...</span></div>`);

export default function Skeleton($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "sm"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("skeleton"));

	const $$d = $.derived(() => skeleton({ size: size() })),
		wrapper = $.derived(() => $.get($$d).wrapper),
		line = $.derived(() => $.get($$d).line);

	var div = root();

	$.attribute_effect(div, ($0) => ({ role: 'status', ...restProps, class: $0 }), [
		() => $.get(wrapper)({ class: clsx($.get(theme)?.wrapper, $$props.class) })
	]);

	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling(div_6, 2);

	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6) => {
			$.set_class(div_1, 1, $0);
			$.set_class(div_2, 1, $1);
			$.set_class(div_3, 1, $2);
			$.set_class(div_4, 1, $3);
			$.set_class(div_5, 1, $4);
			$.set_class(div_6, 1, $5);
			$.set_class(div_7, 1, $6);
		},
		[
			() => $.clsx($.get(line)({
				class: clsx("mb-4 h-2.5 w-1/2", $.get(theme)?.line, $$props.classes?.line)
			})),

			() => $.clsx($.get(line)({
				class: clsx("mb-2.5 h-2 w-9/12", $.get(theme)?.line, $$props.classes?.line)
			})),

			() => $.clsx($.get(line)({
				class: clsx("mb-2.5 h-2", $.get(theme)?.line, $$props.classes?.line)
			})),

			() => $.clsx($.get(line)({
				class: clsx("mb-2.5 h-2", $.get(theme)?.line, $$props.classes?.line)
			})),

			() => $.clsx($.get(line)({
				class: clsx("mb-2.5 h-2 w-10/12", $.get(theme)?.line, $$props.classes?.line)
			})),

			() => $.clsx($.get(line)({
				class: clsx("mb-2.5 h-2 w-11/12", $.get(theme)?.line, $$props.classes?.line)
			})),

			() => $.clsx($.get(line)({
				class: clsx("h-2 w-9/12", $.get(theme)?.line, $$props.classes?.line)
			}))
		]
	);

	$.append($$anchor, div);
	$.pop();
}