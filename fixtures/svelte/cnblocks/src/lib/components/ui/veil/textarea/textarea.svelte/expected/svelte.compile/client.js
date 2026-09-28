import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'value', 'class']);
var root = $.from_html(`<textarea></textarea>`);

export default function Textarea($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var textarea = root();

	$.remove_textarea_child(textarea);

	$.attribute_effect(textarea, ($0) => ({ class: $0, ...restProps }), [
		() => cn("flex field-sizing-content min-h-16 w-full rounded-md border border-input px-3 py-2 text-base transition-colors outline-none not-dark:bg-card placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40", $$props.class)
	]);

	$.bind_this(textarea, ($$value) => ref($$value), () => ref());
	$.bind_value(textarea, value);
	$.append($$anchor, textarea);
	$.pop();
}