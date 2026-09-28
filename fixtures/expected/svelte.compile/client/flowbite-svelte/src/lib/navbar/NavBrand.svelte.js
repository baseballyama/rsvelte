import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { navbarBrand } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<a><!></a>`);

export default function NavBrand($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("navbarBrand"));
	var a = root();

	$.attribute_effect(a, ($0) => ({ ...restProps, class: $0 }), [
		() => navbarBrand({ class: clsx($.get(theme), $$props.class) })
	]);

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}