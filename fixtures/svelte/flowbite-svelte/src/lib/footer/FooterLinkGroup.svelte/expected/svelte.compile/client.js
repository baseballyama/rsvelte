import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { footerLinkGroup } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<ul><!></ul>`);

export default function FooterLinkGroup($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("footerLinkGroup"));
	var ul = root();

	$.attribute_effect(ul, ($0) => ({ ...restProps, class: $0 }), [
		() => footerLinkGroup({ class: clsx($.get(theme), $$props.class) })
	]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children);
	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}