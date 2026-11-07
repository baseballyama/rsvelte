import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { toastContainer } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'position',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function ToastContainer($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "top-right"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("toastContainer"));

	const positionClasses = {
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4"
	};

	const base = $.derived(() => toastContainer({
		class: clsx(positionClasses[position()], $.get(theme), $$props.class)
	}));

	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(base) }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}