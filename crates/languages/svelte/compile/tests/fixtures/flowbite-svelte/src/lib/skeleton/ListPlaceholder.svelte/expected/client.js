import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { listPlaceholder } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'itemNumber',
	'size',
	'rounded',
	'class',
	'classes'
]);

var root = $.from_html(`<div><div><div></div> <div></div></div> <div></div></div>`);
var root_1 = $.from_html(`<div><!> <span class="sr-only">Loading...</span></div>`);

export default function ListPlaceholder($$anchor, $$props) {
	$.push($$props, true);

	let itemNumber = $.prop($$props, 'itemNumber', 3, 5),
		size = $.prop($$props, 'size', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("listPlaceholder"));

	const $$d = $.derived(() => listPlaceholder({ size: size(), rounded: $$props.rounded })),
		base = $.derived(() => $.get($$d).base),
		item = $.derived(() => $.get($$d).item),
		content = $.derived(() => $.get($$d).content),
		title = $.derived(() => $.get($$d).title),
		subTitle = $.derived(() => $.get($$d).subTitle),
		extra = $.derived(() => $.get($$d).extra);

	let items = $.derived(() => [...Array(itemNumber()).keys()]);
	var div = root_1();

	$.attribute_effect(div, ($0) => ({ role: 'status', ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var node = $.child(div);

	$.each(node, 17, () => $.get(items), $.index, ($$anchor, _, i) => {
		var div_1 = root();
		var div_2 = $.child(div_1);
		var div_3 = $.child(div_2);
		var div_4 = $.sibling(div_3, 2);

		$.reset(div_2);

		var div_5 = $.sibling(div_2, 2);

		$.reset(div_1);

		$.template_effect(
			($0, $1, $2, $3, $4) => {
				$.set_class(div_1, 1, $0);
				$.set_class(div_2, 1, $1);
				$.set_class(div_3, 1, $2);
				$.set_class(div_4, 1, $3);
				$.set_class(div_5, 1, $4);
			},
			[
				() => $.clsx($.get(item)({
					class: clsx(i > 0 ? "pt-4" : "", $.get(theme)?.item, $$props.classes?.item)
				})),
				() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $$props.classes?.content) })),
				() => $.clsx($.get(title)({ class: clsx($.get(theme)?.title, $$props.classes?.title) })),
				() => $.clsx($.get(subTitle)({
					class: clsx($.get(theme)?.subTitle, $$props.classes?.subTitle)
				})),
				() => $.clsx($.get(extra)({ class: clsx($.get(theme)?.extra, $$props.classes?.extra) }))
			]
		);

		$.append($$anchor, div_1);
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}