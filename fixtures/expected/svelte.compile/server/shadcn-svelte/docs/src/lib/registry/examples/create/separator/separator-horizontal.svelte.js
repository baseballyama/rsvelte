import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Separator_horizontal($$renderer) {
	Example($$renderer, {
		title: 'Horizontal',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4 text-sm style-lyra:text-xs/relaxed"><div class="flex flex-col gap-1"><div class="leading-none font-medium">shadcn/ui</div> <div class="text-muted-foreground">The Foundation for your Design System</div></div> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <div>A set of beautifully designed components that you can customize, extend, and build on.</div></div>`);
		},
		$$slots: { default: true }
	});
}