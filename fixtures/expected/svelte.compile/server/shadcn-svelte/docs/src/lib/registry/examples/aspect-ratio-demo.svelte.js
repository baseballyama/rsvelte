import * as $ from 'svelte/internal/server';
import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";

export default function Aspect_ratio_demo($$renderer) {
	AspectRatio($$renderer, {
		ratio: 16 / 9,
		class: 'rounded-lg bg-muted',
		children: ($$renderer) => {
			$$renderer.push(`<img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&amp;dpr=2&amp;q=80" alt="Gray by Drew Beamer" class="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"/>`);
		},
		$$slots: { default: true }
	});
}