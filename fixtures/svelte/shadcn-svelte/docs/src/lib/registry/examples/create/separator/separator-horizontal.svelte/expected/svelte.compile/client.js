import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<div class="flex flex-col gap-4 text-sm style-lyra:text-xs/relaxed"><div class="flex flex-col gap-1"><div class="leading-none font-medium">shadcn/ui</div> <div class="text-muted-foreground">The Foundation for your Design System</div></div> <!> <div>A set of beautifully designed components that you can customize, extend, and build on.</div></div>`);

export default function Separator_horizontal($$anchor) {
	Example($$anchor, {
		title: 'Horizontal',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.sibling($.child(div), 2);

			Separator(node, {});
			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}