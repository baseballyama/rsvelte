import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<tr><!></tr>`);

export default function Table_row($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var tr = root();

	$.attribute_effect(tr, ($0) => ({ class: $0, ...restProps }), [
		() => cn('border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50', $$props.class)
	]);

	var node = $.child(tr);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tr);
	$.bind_this(tr, ($$value) => ref($$value), () => ref());
	$.append($$anchor, tr);
	$.pop();
}