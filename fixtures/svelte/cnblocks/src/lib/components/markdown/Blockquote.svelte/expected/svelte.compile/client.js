import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<blockquote><!></blockquote>`);

export default function Blockquote($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var blockquote = root();

	$.attribute_effect(blockquote, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("mt-6 rounded-xl border border-border bg-card px-5 py-3 text-sm text-foreground/70 italic shadow-sm", className())
	]);

	var node = $.child(blockquote);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(blockquote);
	$.append($$anchor, blockquote);
	$.pop();
}