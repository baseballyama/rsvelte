import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { drawerhandle } from "./theme";
import { getDrawerContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'placement',
	'aria-label',
	'class',
	'classes'
]);

var root = $.from_html(`<button><!> <span></span></button>`);

export default function DrawerHandle($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const ctx = getDrawerContext();
	const theme = $.derived(() => getTheme("drawerhandle"));

	let $$d = $.derived(() => drawerhandle({ placement: $$props.placement ?? ctx?.placement ?? "left" })),
		base = $.derived(() => $.get($$d).base),
		handle = $.derived(() => $.get($$d).handle);

	var button = root();

	$.attribute_effect(
		button,
		($0) => ({
			type: 'button',
			'aria-label': $$props['aria-label'],
			...restProps,
			class: $0
		}),
		[
			() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
		]
	);

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);

	var span = $.sibling(node, 2);

	$.reset(button);

	$.template_effect(($0) => $.set_class(span, 1, $0), [
		() => $.clsx($.get(handle)({ class: clsx($.get(theme)?.handle, $$props.classes?.handle) }))
	]);

	$.append($$anchor, button);
	$.pop();
}