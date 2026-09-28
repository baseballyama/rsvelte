import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex items-center gap-2 text-sm md:gap-4 style-lyra:text-xs/relaxed"><div class="flex flex-col gap-1"><span class="font-medium">Settings</span> <span class="text-xs text-muted-foreground">Manage preferences</span></div> <!> <div class="flex flex-col gap-1"><span class="font-medium">Account</span> <span class="text-xs text-muted-foreground">Profile & security</span></div> <!> <div class="flex flex-col gap-1"><span class="font-medium">Help</span> <span class="text-xs text-muted-foreground">Support & docs</span></div></div>`);

export default function Separator_vertical_menu($$anchor) {
	Example($$anchor, {
		title: 'Vertical Menu',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.sibling($.child(div), 2);

			Separator(node, { orientation: 'vertical' });

			var node_1 = $.sibling(node, 4);

			Separator(node_1, { orientation: 'vertical' });
			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}