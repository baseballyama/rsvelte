import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'value']);
var root = $.from_html(`<textarea></textarea>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var textarea = root();

	$.remove_textarea_child(textarea);

	$.attribute_effect(textarea, ($0) => ({ 'data-slot': 'input', class: $0, ...restProps }), [
		() => cn("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", $$props.class)
	]);

	$.bind_value(textarea, value);
	$.append($$anchor, textarea);
	$.pop();
}