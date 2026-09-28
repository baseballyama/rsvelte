import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-col gap-2 text-sm style-lyra:text-xs/relaxed"><dl class="flex items-center justify-between"><dt>Item 1</dt> <dd class="text-muted-foreground">Value 1</dd></dl> <!> <dl class="flex items-center justify-between"><dt>Item 2</dt> <dd class="text-muted-foreground">Value 2</dd></dl> <!> <dl class="flex items-center justify-between"><dt>Item 3</dt> <dd class="text-muted-foreground">Value 3</dd></dl></div>`);

export default function Separator_in_list($$anchor) {
	Example($$anchor, {
		title: 'In List',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.sibling($.child(div), 2);

			Separator(node, {});

			var node_1 = $.sibling(node, 4);

			Separator(node_1, {});
			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}