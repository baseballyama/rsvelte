import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Separator_in_list($$renderer) {
	Example($$renderer, {
		title: 'In List',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-2 text-sm style-lyra:text-xs/relaxed"><dl class="flex items-center justify-between"><dt>Item 1</dt> <dd class="text-muted-foreground">Value 1</dd></dl> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <dl class="flex items-center justify-between"><dt>Item 2</dt> <dd class="text-muted-foreground">Value 2</dd></dl> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <dl class="flex items-center justify-between"><dt>Item 3</dt> <dd class="text-muted-foreground">Value 3</dd></dl></div>`);
		},
		$$slots: { default: true }
	});
}