import * as $ from 'svelte/internal/server';
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Separator_demo($$renderer) {
	$$renderer.push(`<div><div class="space-y-1"><h4 class="text-sm leading-none font-medium">Bits UI Primitives</h4> <p class="text-sm text-muted-foreground">An open-source UI component library.</p></div> `);
	Separator($$renderer, { class: 'my-4' });
	$$renderer.push(`<!----> <div class="flex h-5 items-center space-x-4 text-sm"><div>Blog</div> `);
	Separator($$renderer, { orientation: 'vertical' });
	$$renderer.push(`<!----> <div>Docs</div> `);
	Separator($$renderer, { orientation: 'vertical' });
	$$renderer.push(`<!----> <div>Source</div></div></div>`);
}