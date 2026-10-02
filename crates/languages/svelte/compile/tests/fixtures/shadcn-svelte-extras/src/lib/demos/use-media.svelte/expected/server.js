import * as $ from 'svelte/internal/server';
import { useMedia } from '$lib/hooks/use-media.svelte';
import { scale } from 'svelte/transition';

function breakpoint($$renderer, { name }) {
	$$renderer.push(`<span class="text-xl">${$.escape(name)}</span>`);
}

export default function Use_media($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const media = useMedia();

		$$renderer.push(`<div class="flex flex-col place-items-center gap-2 px-4">`);

		if (media['2xl']) {
			$$renderer.push('<!--[0-->');
			breakpoint($$renderer, { name: '2xl' });
		} else if (media.xl) {
			$$renderer.push('<!--[1-->');
			breakpoint($$renderer, { name: 'xl' });
		} else if (media.lg) {
			$$renderer.push('<!--[2-->');
			breakpoint($$renderer, { name: 'lg' });
		} else if (media.md) {
			$$renderer.push('<!--[3-->');
			breakpoint($$renderer, { name: 'md' });
		} else if (media.sm) {
			$$renderer.push('<!--[4-->');
			breakpoint($$renderer, { name: 'sm' });
		} else {
			$$renderer.push('<!--[-1-->');
			breakpoint($$renderer, { name: '-' });
		}

		$$renderer.push(`<!--]--> <span class="text-muted-foreground text-center text-xs">Resize the window to see the breakpoint change.</span></div>`);
	});
}