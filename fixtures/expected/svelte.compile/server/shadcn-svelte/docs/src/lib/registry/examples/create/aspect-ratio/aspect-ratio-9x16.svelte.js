import * as $ from 'svelte/internal/server';
import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Aspect_ratio_9x16($$renderer) {
	Example($$renderer, {
		title: '9:16',
		class: 'items-center justify-center',
		children: ($$renderer) => {
			AspectRatio($$renderer, {
				ratio: 9 / 16,
				class: 'rounded-lg bg-muted',
				children: ($$renderer) => {
					$$renderer.push(`<img src="https://avatar.vercel.sh/shadcn1" alt="shadcn1" class="h-full w-full rounded-lg object-cover grayscale dark:brightness-20"/>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}