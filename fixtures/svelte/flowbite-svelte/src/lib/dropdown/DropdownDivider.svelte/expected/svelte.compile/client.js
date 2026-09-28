import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dropdownDivider } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<div></div>`);

export default function DropdownDivider($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("dropdownDivider"));
	var div = root();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => dropdownDivider({ class: clsx($.get(theme), $$props.class) })
	]);

	$.append($$anchor, div);
	$.pop();
}