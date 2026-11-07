import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<section><div class="container-wrapper"><div class="container flex flex-col items-center gap-2 py-8 text-center md:py-16 lg:py-20 xl:gap-4"><!></div></div></section>`);

export default function Page_header($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var section = root();

	$.attribute_effect(section, ($0) => ({ class: $0, ...restProps }), [() => cn("border-grid", $$props.class)]);

	var div = $.child(section);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}