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

var root = $.from_html(`<fieldset><!></fieldset>`);

export default function Field_set($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fieldset = root();

	$.attribute_effect(fieldset, ($0) => ({ 'data-slot': 'field-set', class: $0, ...restProps }), [
		() => cn('flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3', $$props.class)
	]);

	var node = $.child(fieldset);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(fieldset);
	$.bind_this(fieldset, ($$value) => ref($$value), () => ref());
	$.append($$anchor, fieldset);
	$.pop();
}