import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<div><div class="space-y-1"><h4 class="text-sm leading-none font-medium">Bits UI Primitives</h4> <p class="text-sm text-muted-foreground">An open-source UI component library.</p></div> <!> <div class="flex h-5 items-center space-x-4 text-sm"><div>Blog</div> <!> <div>Docs</div> <!> <div>Source</div></div></div>`);

export default function Separator_demo($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	Separator(node, { class: 'my-4' });

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Separator(node_1, { orientation: 'vertical' });

	var node_2 = $.sibling(node_1, 4);

	Separator(node_2, { orientation: 'vertical' });
	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}