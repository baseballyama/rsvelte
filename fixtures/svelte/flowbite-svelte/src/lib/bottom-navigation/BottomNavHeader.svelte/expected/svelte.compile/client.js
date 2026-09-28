import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { bottomNavHeader } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'classes',
	'outerClass',
	'innerClass'
]);

var root = $.from_html(`<div><div role="group"><!></div></div>`);

export default function BottomNavHeader($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"BottomNavHeader",
		untrack(() => ({
			innerClass: $$props.innerClass,
			outerClass: $$props.outerClass
		})),
		{ innerClass: "inner", outerClass: "class" }
	);

	const styling = $.derived(() => $$props.classes ?? { innerDiv: $$props.innerClass });

	// Theme context
	const theme = $.derived(() => getTheme("bottomNavHeader"));

	const $$d = $.derived(bottomNavHeader),
		innerDiv = $.derived(() => $.get($$d).innerDiv),
		base = $.derived(() => $.get($$d).base);

	var div = root();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({
			class: clsx($.get(theme)?.base, $$props.class ?? $$props.outerClass)
		})
	]);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div_1, 1, $0), [
		() => $.clsx($.get(innerDiv)({ class: clsx($.get(theme)?.innerDiv, $.get(styling).innerDiv) }))
	]);

	$.append($$anchor, div);
	$.pop();
}