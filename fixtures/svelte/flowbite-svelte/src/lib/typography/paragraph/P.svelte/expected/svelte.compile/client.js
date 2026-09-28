import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { paragraph } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'height',
	'align',
	'justify',
	'italic',
	'firstUpper',
	'whitespace',
	'size',
	'space',
	'weight'
]);

var root = $.from_html(`<p><!></p>`);

export default function P($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, "text-gray-900 dark:text-white"),
		height = $.prop($$props, 'height', 3, "normal"),
		align = $.prop($$props, 'align', 3, "left"),
		justify = $.prop($$props, 'justify', 3, false),
		firstUpper = $.prop($$props, 'firstUpper', 3, false),
		whitespace = $.prop($$props, 'whitespace', 3, "normal"),
		size = $.prop($$props, 'size', 3, "base"),
		space = $.prop($$props, 'space', 3, "normal"),
		weight = $.prop($$props, 'weight', 3, "normal"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("paragraph"));

	let classP = $.derived(() => paragraph({
		height: height(),
		size: size(),
		weight: weight(),
		space: space(),
		align: align(),
		justify: justify(),
		italic: $$props.italic,
		firstUpper: firstUpper(),
		whitespace: whitespace(),
		class: clsx($.get(theme), className())
	}));

	var p = root();

	$.attribute_effect(p, () => ({ ...restProps, class: $.get(classP) }));

	var node = $.child(p);

	$.snippet(node, () => $$props.children);
	$.reset(p);
	$.append($$anchor, p);
	$.pop();
}