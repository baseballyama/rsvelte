import * as $ from 'svelte/internal/server';
import { TAILWIND_BREAKPOINTS, useMedia } from '$lib/hooks/use-media.svelte';
import { scale } from 'svelte/transition';

export default function Use_media_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const media = useMedia({ ...TAILWIND_BREAKPOINTS, custom: '500px' });

		$$renderer.push(`<div class="flex flex-col place-items-center gap-2 px-4">`);

		if (media.custom) {
			$$renderer.push(`<!--[0--><span class="text-xl">custom</span>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="text-xl">-</span>`);
		}

		$$renderer.push(`<!--]--> <span class="text-muted-foreground text-center text-xs">Resize the window to see the breakpoint change at 500px.</span></div>`);
	});
}