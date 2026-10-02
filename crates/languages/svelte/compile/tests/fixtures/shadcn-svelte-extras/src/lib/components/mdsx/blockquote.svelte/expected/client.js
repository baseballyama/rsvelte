import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<blockquote><!></blockquote>`);

export default function Blockquote($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var blockquote = root();

	$.attribute_effect(blockquote, ($0) => ({ class: $0, ...restProps }), [
		() => cn('border-border mt-6 border-l-2 pl-6 italic', $$props.class)
	]);

	var node = $.child(blockquote);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(blockquote);
	$.append($$anchor, blockquote);
	$.pop();
}