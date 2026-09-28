import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="border-input bg-background ring-offset-background focus-within:border-ring focus-within:ring-ring/30 relative rounded-lg border shadow-xs shadow-black/[.04] transition-shadow focus-within:ring-2 focus-within:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50 [&amp;:has(input:is(:disabled))_*]:pointer-events-none"><label class="text-foreground block px-3 pt-2 text-xs font-medium">Textarea with inset label</label> <textarea class="text-foreground placeholder:text-muted-foreground/70 flex min-h-[70px] w-full bg-transparent px-3 pb-2 text-sm focus-visible:outline-hidden"></textarea></div>`);

export default function Textarea_15($$anchor) {
	const uid = $.props_id();
	var div = root();
	var label = $.child(div);
	var textarea = $.sibling(label, 2);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(label, 'for', uid);
		$.set_attribute(textarea, 'id', uid);
	});

	$.append($$anchor, div);
}