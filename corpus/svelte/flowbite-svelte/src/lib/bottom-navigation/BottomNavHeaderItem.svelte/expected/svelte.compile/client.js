import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { bottomNavHeaderItem } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'itemName',
	'active',
	'class'
]);

var root = $.from_html(`<button> </button>`);

export default function BottomNavHeaderItem($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	// Theme context
	const theme = $.derived(() => getTheme("bottomNavHeaderItem"));

	let base = $.derived(() => bottomNavHeaderItem({
		active: $$props.active,
		class: clsx($.get(theme), $$props.class)
	}));

	var button = root();

	$.attribute_effect(button, () => ({ ...restProps, class: $.get(base) }));

	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $$props.itemName));
	$.append($$anchor, button);
	$.pop();
}