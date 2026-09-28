import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { activity } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<ol><!></ol>`);

export default function Activity($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("activity"));
	var ol = root();

	$.attribute_effect(ol, ($0) => ({ ...restProps, class: $0 }), [() => activity({ class: clsx($.get(theme), $$props.class) })]);

	var node = $.child(ol);

	$.snippet(node, () => $$props.children);
	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}