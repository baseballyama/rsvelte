import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { avatarIconBase, sizeStyle } from "./styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'icon',
	'iconBackground',
	'class'
]);

var root = $.from_html(`<span><span class="flex items-center justify-center"><!></span></span>`);

export default function Avatar_with_icon($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, 32),
		iconBackground = $.prop($$props, 'iconBackground', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	let iconSize = $.derived(() => Math.round(size() / 2.1));
	var span = root();

	$.attribute_effect(
		span,
		($0) => ({
			...rest,
			class: [
				avatarIconBase,
				iconBackground() ? "" : "bg-transparent",
				$$props.class
			],
			style: $0
		}),
		[() => sizeStyle(size())]
	);

	var span_1 = $.child(span);
	var node = $.child(span_1);

	$.snippet(node, () => $$props.icon);
	$.reset(span_1);
	$.reset(span);
	$.template_effect(() => $.set_style(span_1, `width: ${$.get(iconSize) ?? ''}px; height: ${$.get(iconSize) ?? ''}px;`));
	$.append($$anchor, span);
	$.pop();
}