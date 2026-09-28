import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<code><!></code>`);

export default function Code($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var code = root();

	$.attribute_effect(code, ($0) => ({ class: $0, ...restProps }), [
		() => cn("rounded-button bg-muted text-foreground/60 relative inline-flex h-[27px] items-center justify-center px-[8px] font-mono text-xs font-medium tracking-tighter sm:text-sm", $$props.class, "custom")
	]);

	var node = $.child(code);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(code);
	$.append($$anchor, code);
	$.pop();
}