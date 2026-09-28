import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { layout } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<div><!></div>`);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("layout"));
	let divCls = $.derived(() => layout({ class: clsx($.get(theme), $$props.class) }));
	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(divCls) }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}