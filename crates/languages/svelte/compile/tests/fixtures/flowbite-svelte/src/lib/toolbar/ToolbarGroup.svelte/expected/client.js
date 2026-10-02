import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getToolbarContext } from "$lib/context";
import { toolbarGroup } from "./theme";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'spacing',
	'padding',
	'position',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function ToolbarGroup($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "middle"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("toolbarGroup"));

	const groupCls = $.derived(() => toolbarGroup({
		spacing: $$props.spacing,
		padding: $$props.padding,
		position: position(),
		class: clsx($.get(theme), $$props.class)
	}));

	const ctx = getToolbarContext();

	if (ctx) ctx.separators = true;

	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(groupCls) }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}