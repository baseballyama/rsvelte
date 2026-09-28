import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<header class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"><div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6"><!> <!> <h1 class="text-base font-medium">Documents</h1> <div class="ms-auto flex items-center gap-2"><!></div></div></header>`);

export default function Site_header($$anchor) {
	var header = root();
	var div = $.child(header);
	var node = $.child(div);

	$.component(node, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
		Sidebar_Trigger($$anchor, { class: '-ms-1' });
	});

	var node_1 = $.sibling(node, 2);

	Separator(node_1, {
		orientation: 'vertical',
		class: 'mx-2 data-[orientation=vertical]:h-4'
	});

	var div_1 = $.sibling(node_1, 4);
	var node_2 = $.child(div_1);

	Button(node_2, {
		href: 'https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard',
		variant: 'ghost',
		size: 'sm',
		class: 'hidden sm:flex dark:text-foreground',
		target: '_blank',
		rel: 'noopener noreferrer',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('GitHub');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
}