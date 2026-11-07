import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_outline($$renderer) {
	Badge($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outline`);
		},
		$$slots: { default: true }
	});
}