import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { testimonialPlaceholder } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'classes']);
var root = $.from_html(`<div><div></div> <div></div> <div><svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg> <div></div> <div></div></div> <span class="sr-only">Loading...</span></div>`);

export default function TestimonialPlaceholder($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("testimonialPlaceholder"));
	const { base, lineA, lineB, svg, content } = testimonialPlaceholder();
	var div = root();

	$.attribute_effect(div, ($0) => ({ role: 'status', ...restProps, class: $0 }), [
		() => base({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var svg_1 = $.child(div_3);
	var div_4 = $.sibling(svg_1, 2);
	var div_5 = $.sibling(div_4, 2);

	$.reset(div_3);
	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5) => {
			$.set_class(div_1, 1, $0);
			$.set_class(div_2, 1, $1);
			$.set_class(div_3, 1, $2);
			$.set_class(svg_1, 0, $3);
			$.set_class(div_4, 1, $4);
			$.set_class(div_5, 1, $5);
		},
		[
			() => $.clsx(lineB({
				class: clsx("mx-auto mb-2.5 h-2.5 max-w-[640px]", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),

			() => $.clsx(lineB({
				class: clsx("mx-auto h-2.5 max-w-[540px]", $.get(theme)?.lineB, $$props.classes?.lineB)
			})),
			() => $.clsx(content({ class: clsx($.get(theme)?.content, $$props.classes?.content) })),
			() => $.clsx(svg({ class: clsx($.get(theme)?.svg, $$props.classes?.svg) })),
			() => $.clsx(lineA({
				class: clsx("me-3 h-2.5 w-20", $.get(theme)?.lineA, $$props.classes?.lineA)
			})),

			() => $.clsx(lineA({
				class: clsx("h-2 w-24", $.get(theme)?.lineA, $$props.classes?.lineA)
			}))
		]
	);

	$.append($$anchor, div);
	$.pop();
}