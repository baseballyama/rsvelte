import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { descriptionList } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'tag',
	'class'
]);

export default function DescriptionList($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const theme = $.derived(() => getTheme("descriptionList"));
	let descCls = $.derived(() => descriptionList({ tag: $$props.tag, class: clsx($.get(theme), $$props.class) }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => $$props.tag, false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ ...restProps, class: $.get(descCls) }));

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.snippet(node_1, () => $$props.children);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}