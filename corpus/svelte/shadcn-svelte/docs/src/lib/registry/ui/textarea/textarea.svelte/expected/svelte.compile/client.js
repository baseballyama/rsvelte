import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'data-slot'
]);

var root = $.from_html(`<textarea></textarea>`);

export default function Textarea($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		dataSlot = $.prop($$props, 'data-slot', 3, "textarea"),
		restProps = $.rest_props($$props, rest_excludes);

	var textarea = root();

	$.remove_textarea_child(textarea);

	$.attribute_effect(textarea, ($0) => ({ 'data-slot': dataSlot(), class: $0, ...restProps }), [
		() => cn("cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", $$props.class)
	]);

	$.bind_this(textarea, ($$value) => ref($$value), () => ref());
	$.bind_value(textarea, value);
	$.append($$anchor, textarea);
	$.pop();
}