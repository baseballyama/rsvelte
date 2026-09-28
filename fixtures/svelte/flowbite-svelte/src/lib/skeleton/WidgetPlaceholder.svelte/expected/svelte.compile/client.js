import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { widgetPlaceholder } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var root = $.from_html(`<div role="status"><div></div> <div></div> <div><div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div></div> <span class="sr-only">Loading...</span></div>`);

export default function WidgetPlaceholder($$anchor, $$props) {
	$.push($$props, true);

	const theme = $.derived(() => getTheme("widgetPlaceholder"));
	const { base, wrapper, vLine, hLine } = widgetPlaceholder({});
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.sibling(div_4, 2);
	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.sibling(div_7, 2);
	var div_9 = $.sibling(div_8, 2);
	var div_10 = $.sibling(div_9, 2);

	$.reset(div_3);
	$.next(2);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
			$.set_class(div_2, 1, $2);
			$.set_class(div_3, 1, $3);
			$.set_class(div_4, 1, $4);
			$.set_class(div_5, 1, $5);
			$.set_class(div_6, 1, $6);
			$.set_class(div_7, 1, $7);
			$.set_class(div_8, 1, $8);
			$.set_class(div_9, 1, $9);
			$.set_class(div_10, 1, $10);
		},
		[
			() => $.clsx(base({ class: clsx($.get(theme)?.base, $$props.class) })),
			() => $.clsx(hLine({ class: clsx("mb-2.5 h-2.5 w-32", $$props.classes?.hLine) })),
			() => $.clsx(hLine({ class: clsx("mb-10 h-2 w-48", $$props.classes?.hLine) })),
			() => $.clsx(wrapper()),
			() => $.clsx(vLine({ class: clsx("h-72", $$props.classes?.vLine) })),
			() => $.clsx(vLine({ class: clsx("h-56", $$props.classes?.vLine) })),
			() => $.clsx(vLine({ class: clsx("h-72", $$props.classes?.vLine) })),
			() => $.clsx(vLine({ class: clsx("h-64", $$props.classes?.vLine) })),
			() => $.clsx(vLine({ class: clsx("h-80", $$props.classes?.vLine) })),
			() => $.clsx(vLine({ class: clsx("h-72", $$props.classes?.vLine) })),
			() => $.clsx(vLine({ class: clsx("h-80", $$props.classes?.vLine) }))
		]
	);

	$.append($$anchor, div);
	$.pop();
}