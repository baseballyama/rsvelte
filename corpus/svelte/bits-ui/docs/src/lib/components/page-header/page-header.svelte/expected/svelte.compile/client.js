import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<section><!></section>`);

export default function Page_header($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var section = root();

	$.attribute_effect(section, ($0) => ({ class: $0, ...restProps }), [() => cn("relative", $$props.class)]);

	var node = $.child(section);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}