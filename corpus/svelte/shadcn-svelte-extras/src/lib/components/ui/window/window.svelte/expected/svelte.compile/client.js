import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<div><div class="border-b border-inherit p-4"><div class="flex items-center gap-2"><div class="size-2 rounded-full bg-[#ef4444]"></div> <div class="size-2 rounded-full bg-[#eab308]"></div> <div class="size-2 rounded-full bg-[#22c55e]"></div></div></div> <div><!></div></div>`);

export default function Window($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_class(div, 1, $0);
			$.set_class(div_1, 1, $1);
		},
		[
			() => $.clsx(cn('border-border bg-background aspect-video w-full rounded-lg border', $$props.class)),
			() => $.clsx(cn('p-4', $$props.contentClass))
		]
	);

	$.append($$anchor, div);
	$.pop();
}