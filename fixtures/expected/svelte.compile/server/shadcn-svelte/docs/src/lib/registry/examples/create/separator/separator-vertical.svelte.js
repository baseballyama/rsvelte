import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Separator_vertical($$renderer) {
	Example($$renderer, {
		title: 'Vertical',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex h-5 items-center gap-4 text-sm style-lyra:text-xs/relaxed"><div>Blog</div> `);
			Separator($$renderer, { orientation: 'vertical' });
			$$renderer.push(`<!----> <div>Docs</div> `);
			Separator($$renderer, { orientation: 'vertical' });
			$$renderer.push(`<!----> <div>Source</div></div>`);
		},
		$$slots: { default: true }
	});
}