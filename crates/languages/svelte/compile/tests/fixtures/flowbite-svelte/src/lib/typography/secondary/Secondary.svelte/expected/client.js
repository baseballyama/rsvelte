import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { secondary } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<small><!></small>`);

export default function Secondary($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("secondary"));
	var small = root();

	$.attribute_effect(small, ($0) => ({ ...restProps, class: $0 }), [
		() => secondary({ class: clsx($.get(theme), $$props.class) })
	]);

	var node = $.child(small);

	$.snippet(node, () => $$props.children);
	$.reset(small);
	$.append($$anchor, small);
	$.pop();
}