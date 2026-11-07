import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<img src="https://avatar.vercel.sh/shadcn1" alt="shadcn1" class="h-full w-full rounded-lg object-cover grayscale dark:brightness-20"/>`);

export default function Aspect_ratio_16x9($$anchor) {
	Example($$anchor, {
		title: '16:9',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			AspectRatio($$anchor, {
				ratio: 16 / 9,
				class: 'rounded-lg bg-muted',
				children: ($$anchor, $$slotProps) => {
					var img = root();

					$.append($$anchor, img);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}