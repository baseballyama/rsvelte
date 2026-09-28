import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import { blockquote } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'border',
	'italic',
	'bg',
	'alignment',
	'size'
]);

var root = $.from_html(`<blockquote><!></blockquote>`);

export default function Blockquote($$anchor, $$props) {
	$.push($$props, true);

	let italic = $.prop($$props, 'italic', 3, true),
		alignment = $.prop($$props, 'alignment', 3, "left"),
		size = $.prop($$props, 'size', 3, "lg"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("blockquote"));

	let blockquoteCls = $.derived(() => blockquote({
		border: $$props.border,
		italic: italic(),
		bg: $$props.bg,
		alignment: alignment(),
		size: size(),
		class: clsx($.get(theme), $$props.class)
	}));

	var blockquote_1 = root();

	$.attribute_effect(blockquote_1, () => ({ ...restProps, class: $.get(blockquoteCls) }));

	var node = $.child(blockquote_1);

	$.snippet(node, () => $$props.children);
	$.reset(blockquote_1);
	$.append($$anchor, blockquote_1);
	$.pop();
}