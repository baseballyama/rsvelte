import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<a><!></a>`);

export default function Link($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var a = root();

	$.attribute_effect(a, ($0) => ({ ...rest, class: $0 }), [
		() => cn('text-foreground font-medium underline underline-offset-4', $$props.class)
	]);

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}