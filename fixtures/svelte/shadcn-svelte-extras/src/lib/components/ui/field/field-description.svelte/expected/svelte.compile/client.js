import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<p><!></p>`);

export default function Field_description($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var p = root();

	$.attribute_effect(p, ($0) => ({ 'data-slot': 'field-description', class: $0, ...restProps }), [
		() => cn('text-muted-foreground text-left text-sm leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance [[data-variant=legend]+&]:-mt-1.5', 'last:mt-0 nth-last-2:-mt-1', '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4', $$props.class)
	]);

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.bind_this(p, ($$value) => ref($$value), () => ref());
	$.append($$anchor, p);
	$.pop();
}