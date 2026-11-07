import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { getListContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'icon',
	'class'
]);

var root = $.from_html(`<li><!></li>`);

export default function Li($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const ctx = getListContext();
	let liCls = $.derived(() => clsx(ctx?.ctxClass, $$props.icon && "flex items-center", $$props.class));
	var li = root();

	$.attribute_effect(li, () => ({ ...restProps, class: $.get(liCls) }));

	var node = $.child(li);

	$.snippet(node, () => $$props.children);
	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}