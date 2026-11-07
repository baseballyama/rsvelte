import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "bits-ui";

var root = $.from_html(`<div><div class="space-y-1"><h4 class="font-semibold">Bits UI</h4> <p class="text-muted-foreground text-sm">Headless UI components for Svelte.</p></div> <!> <div class="flex h-5 items-center space-x-4 text-sm"><div>Blog</div> <!> <div>Docs</div> <!> <div>Source</div></div></div>`);

export default function Separator_demo($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Separator.Root, ($$anchor, Separator_Root) => {
		Separator_Root($$anchor, {
			class: 'bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]'
		});
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	$.component(node_1, () => Separator.Root, ($$anchor, Separator_Root_1) => {
		Separator_Root_1($$anchor, {
			orientation: 'vertical',
			class: 'bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]'
		});
	});

	var node_2 = $.sibling(node_1, 4);

	$.component(node_2, () => Separator.Root, ($$anchor, Separator_Root_2) => {
		Separator_Root_2($$anchor, {
			orientation: 'vertical',
			class: 'bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]'
		});
	});

	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}