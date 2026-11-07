import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { navbarContainer } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'fluid',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function NavContainer($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("navbarContainer"));
	var div = root();

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => navbarContainer({
			fluid: $$props.fluid,
			class: clsx($.get(theme), $$props.class)
		})
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}