import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { kbd } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<kbd><!></kbd>`);

export default function Kbd($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("kbd"));
	const kbdCls = $.derived(() => kbd({ class: clsx($.get(theme), $$props.class) }));
	var kbd_1 = root();

	$.attribute_effect(kbd_1, () => ({ ...restProps, class: $.get(kbdCls) }));

	var node = $.child(kbd_1);

	$.snippet(node, () => $$props.children);
	$.reset(kbd_1);
	$.append($$anchor, kbd_1);
	$.pop();
}