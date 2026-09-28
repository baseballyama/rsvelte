import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CirclePlusFilledIcon from "@tabler/icons-svelte/icons/circle-plus-filled";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span>Quick Create</span>`, 1);
var root_1 = $.from_html(`<header class="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/90 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"><div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6"><h1 class="text-base font-medium">Documents</h1> <div class="ms-auto flex items-center gap-2"><!></div></div></header>`);

export default function Site_header($$anchor) {
	var header = root_1();
	var div = $.child(header);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Button(node, {
		size: 'sm',
		class: 'hidden h-7 sm:flex',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			CirclePlusFilledIcon(node_1, {});
			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}