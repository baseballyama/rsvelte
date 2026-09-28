import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { group } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'divClass',
	'timeClass',
	'date',
	'olClass',
	'class',
	'classes'
]);

var root = $.from_html(`<div><time> </time> <ol><!></ol></div>`);

export default function Group($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Group",
		untrack(() => ({
			divClass: $$props.divClass,
			timeClass: $$props.timeClass,
			olClass: $$props.olClass
		})),
		{ divClass: "class", timeClass: "time", olClass: "ol" }
	);

	const styling = $.derived(() => ({ time: $$props.timeClass, ol: $$props.olClass }));
	const theme = $.derived(() => getTheme("group"));

	const $$d = $.derived(group),
		div = $.derived(() => $.get($$d).div),
		time = $.derived(() => $.get($$d).time),
		ol = $.derived(() => $.get($$d).ol);

	var div_1 = root();
	var time_1 = $.child(div_1);
	var text = $.only_child(time_1, true);
	var ol_1 = $.sibling(time_1, 2);

	$.attribute_effect(ol_1, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(ol)({ class: clsx($.get(theme)?.ol, $.get(styling).ol) })
	]);

	var node = $.child(ol_1);

	$.snippet(node, () => $$props.children);
	$.reset(ol_1);
	$.reset(div_1);

	$.template_effect(
		($0, $1) => {
			$.set_class(div_1, 1, $0);
			$.set_class(time_1, 1, $1);
			$.set_text(text, $$props.date);
		},
		[
			() => $.clsx($.get(div)({
				class: clsx($.get(theme)?.div, $$props.class ?? $$props.divClass)
			})),
			() => $.clsx($.get(time)({ class: clsx($.get(theme)?.time, $.get(styling).time) }))
		]
	);

	$.append($$anchor, div_1);
	$.pop();
}