import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { helper } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'color'
]);

var root = $.from_html(`<p><!></p>`);

export default function Helper($$anchor, $$props) {
	$.push($$props, true);

	let color = $.prop($$props, 'color', 3, "gray"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("helper"));
	const base = $.derived(() => helper({ color: color(), class: clsx($.get(theme), $$props.class) }));
	var p = root();

	$.attribute_effect(p, () => ({ ...restProps, class: $.get(base) }));

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.append($$anchor, p);
	$.pop();
}