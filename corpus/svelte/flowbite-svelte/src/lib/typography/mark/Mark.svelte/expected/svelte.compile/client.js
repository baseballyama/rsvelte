import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { mark } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<mark><!></mark>`);

export default function Mark($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("mark"));
	var mark_1 = root();

	$.attribute_effect(mark_1, ($0) => ({ ...restProps, class: $0 }), [() => mark({ class: clsx($.get(theme), $$props.class) })]);

	var node = $.child(mark_1);

	$.snippet(node, () => $$props.children);
	$.reset(mark_1);
	$.append($$anchor, mark_1);
	$.pop();
}