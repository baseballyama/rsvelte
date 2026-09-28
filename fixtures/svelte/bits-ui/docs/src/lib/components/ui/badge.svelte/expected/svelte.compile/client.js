import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<span><!></span>`);

export default function Badge($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var span = root();

	$.attribute_effect(span, ($0) => ({ class: $0, ...restProps }), [
		() => cn("ml-2 rounded-[4px] bg-[#FCDAFE] px-1.5 py-1 text-[0.7rem] font-semibold leading-none text-[#2A266B] no-underline group-hover:no-underline", $$props.class)
	]);

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.append($$anchor, span);
	$.pop();
}