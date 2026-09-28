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
		() => cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", $$props.class)
	]);

	$.bind_this(textarea, ($$value) => ref($$value), () => ref());
	$.bind_value(textarea, value);
	$.append($$anchor, textarea);
	$.pop();
}