import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<figcaption><!></figcaption>`);

export default function Figcaption($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var figcaption = root();

	$.attribute_effect(figcaption, ($0) => ({ class: $0, ...restProps }), [
		() => cn('text-muted-foreground flex items-center gap-2 text-sm [&_svg]:size-4 [&_svg]:opacity-70', $$props.class)
	]);

	var node = $.child(figcaption);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(figcaption);
	$.append($$anchor, figcaption);
	$.pop();
}