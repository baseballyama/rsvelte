import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footerLink } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'liClass',
	'aClass',
	'href',
	'classes',
	'class'
]);

var root = $.from_html(`<li><a><!></a></li>`);

export default function FooterLink($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("FooterLink", untrack(() => ({ liClass: $$props.liClass, aClass: $$props.aClass })), { liClass: "class", aClass: "link" });

	// link, bySpan
	const styling = $.derived(() => $$props.classes ?? { link: $$props.aClass });

	const theme = $.derived(() => getTheme("footerLink"));
	const { base, link } = footerLink();
	var li = root();
	var a = $.child(li);

	$.attribute_effect(a, ($0) => ({ ...restProps, href: $$props.href, class: $0 }), [
		() => link({ class: clsx($.get(theme)?.link, $.get(styling).link) })
	]);

	var node = $.child(a);

	$.snippet(node, () => $$props.children);
	$.reset(a);
	$.reset(li);

	$.template_effect(($0) => $.set_class(li, 1, $0), [
		() => $.clsx(base({
			class: clsx($.get(theme)?.base, $$props.class ?? $$props.liClass)
		}))
	]);

	$.append($$anchor, li);
	$.pop();
}