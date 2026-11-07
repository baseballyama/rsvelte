import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footer } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'footerType',
	'class'
]);

var root = $.from_html(`<footer><!></footer>`);

export default function Footer($$anchor, $$props) {
	$.push($$props, true);

	let footerType = $.prop($$props, 'footerType', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("footer"));

	const footerCls = $.derived(() => footer({
		footerType: footerType(),
		class: clsx($.get(theme), $$props.class)
	}));

	var footer_1 = root();

	$.attribute_effect(footer_1, () => ({ ...restProps, class: $.get(footerCls) }));

	var node = $.child(footer_1);

	$.snippet(node, () => $$props.children);
	$.reset(footer_1);
	$.append($$anchor, footer_1);
	$.pop();
}