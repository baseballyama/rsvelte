import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { breadcrumb } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'solid',
	'class',
	'classes',
	'olClass',
	'ariaLabel'
]);

var root = $.from_html(`<nav><ol><!></ol></nav>`);

export default function Breadcrumb($$anchor, $$props) {
	$.push($$props, true);

	let solid = $.prop($$props, 'solid', 3, false),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "Breadcrumb"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("Breadcrumb", untrack(() => ({ olClass: $$props.olClass })), { olClass: "list" });

	const styling = $.derived(() => $$props.classes ?? { list: $$props.olClass });
	const theme = $.derived(() => getTheme("breadcrumb"));

	const $$d = $.derived(() => breadcrumb({ solid: solid() })),
		base = $.derived(() => $.get($$d).base),
		list = $.derived(() => $.get($$d).list);

	let classNav = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));
	let classList = $.derived(() => $.get(list)({ class: clsx($.get(theme)?.list, $.get(styling).list) }));
	var nav = root();

	$.attribute_effect(nav, () => ({
		'aria-label': ariaLabel(),
		...restProps,
		class: $.get(classNav)
	}));

	var ol = $.child(nav);
	var node = $.child(ol);

	$.snippet(node, () => $$props.children);
	$.reset(ol);
	$.reset(nav);
	$.template_effect(() => $.set_class(ol, 1, $.clsx($.get(classList))));
	$.append($$anchor, nav);
	$.pop();
}