import * as $ from 'svelte/internal/server';
import { movable } from '@svelte-put/movable';
import { onMount } from 'svelte';

export default function Ignore($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mounted = false;

		onMount(() => {
			setTimeout(
				() => {
					mounted = true;
				},
				500
			);
		});

		$$renderer.push(`<div class="hl-info z-overlay grid h-40 w-40 place-items-center">`);

		if (mounted) {
			$$renderer.push(`<!--[0--><p class="to-ignore hl-error cursor-auto p-2 text-sm">To ignore</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}