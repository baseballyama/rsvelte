import * as $ from 'svelte/internal/server';
import { isMac } from '$lib/hooks/is-mac.svelte';
import * as Icons from '$lib/components/icons';

export default function Is_mac($$renderer) {
	if (isMac) {
		$$renderer.push(`<!--[0--><div class="flex h-[264px] w-60 items-center justify-center">`);

		if (Icons.Apple) {
			$$renderer.push('<!--[-->');
			Icons.Apple($$renderer, { class: 'size-10 rounded-lg' });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	} else {
		$$renderer.push(`<!--[-1--><div class="flex flex-col items-center justify-center gap-2"><img src="/docs/microsoft.jpeg" alt="Windows" class="size-60 rounded-lg"/> <span class="text-muted-foreground text-xs">(sorry Linux users)</span></div>`);
	}

	$$renderer.push(`<!--]-->`);
}