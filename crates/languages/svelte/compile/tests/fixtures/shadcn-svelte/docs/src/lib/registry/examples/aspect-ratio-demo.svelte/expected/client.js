import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";

var root = $.from_html(`<img src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&amp;dpr=2&amp;q=80" alt="Gray by Drew Beamer" class="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"/>`);

export default function Aspect_ratio_demo($$anchor) {
	AspectRatio($$anchor, {
		ratio: 16 / 9,
		class: 'rounded-lg bg-muted',
		children: ($$anchor, $$slotProps) => {
			var img = root();

			$.append($$anchor, img);
		},
		$$slots: { default: true }
	});
}