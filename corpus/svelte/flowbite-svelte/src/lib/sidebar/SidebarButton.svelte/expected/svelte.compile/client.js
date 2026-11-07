import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { sidebarButton } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'breakpoint',
	'class',
	'classes'
]);

var root = $.from_html(`<button><span class="sr-only">Open sidebar</span> <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path></svg></button>`);

export default function SidebarButton($$anchor, $$props) {
	$.push($$props, true);

	let breakpoint = $.prop($$props, 'breakpoint', 3, "md"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("sidebarButton"));

	const $$d = $.derived(() => sidebarButton({ breakpoint: breakpoint() })),
		base = $.derived(() => $.get($$d).base),
		svg = $.derived(() => $.get($$d).svg);

	var button = root();

	$.attribute_effect(button, ($0) => ({ ...restProps, type: 'button', class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var svg_1 = $.sibling($.child(button), 2);

	$.reset(button);

	$.template_effect(($0) => $.set_class(svg_1, 0, $0), [
		() => $.clsx($.get(svg)({ class: clsx($.get(theme)?.svg, $$props.classes?.svg) }))
	]);

	$.append($$anchor, button);
	$.pop();
}