import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from "svelte";
import { timeline } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'order',
	'class'
]);

var root = $.from_html(`<ol><!></ol>`);

export default function Timeline($$anchor, $$props) {
	$.push($$props, true);

	let order = $.prop($$props, 'order', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("timeline"));

	// svelte-ignore state_referenced_locally
	setContext("order", order());

	const olCls = $.derived(() => timeline({ order: order(), class: clsx($.get(theme), $$props.class) }));
	var ol = root();

	$.attribute_effect(ol, () => ({ ...restProps, class: $.get(olCls) }));

	var node = $.child(ol);

	$.snippet(node, () => $$props.children);
	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}