import * as $ from 'svelte/internal/server';
import { Separator } from "bits-ui";

export default function Separator_demo($$renderer) {
	$$renderer.push(`<div><div class="space-y-1"><h4 class="font-semibold">Bits UI</h4> <p class="text-muted-foreground text-sm">Headless UI components for Svelte.</p></div> `);

	if (Separator.Root) {
		$$renderer.push('<!--[-->');

		Separator.Root($$renderer, {
			class: 'bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]'
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <div class="flex h-5 items-center space-x-4 text-sm"><div>Blog</div> `);

	if (Separator.Root) {
		$$renderer.push('<!--[-->');

		Separator.Root($$renderer, {
			orientation: 'vertical',
			class: 'bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]'
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <div>Docs</div> `);

	if (Separator.Root) {
		$$renderer.push('<!--[-->');

		Separator.Root($$renderer, {
			orientation: 'vertical',
			class: 'bg-border my-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]'
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <div>Source</div></div></div>`);
}