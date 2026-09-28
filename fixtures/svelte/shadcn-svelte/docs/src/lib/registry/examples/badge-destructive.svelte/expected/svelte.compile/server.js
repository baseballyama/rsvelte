import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_destructive($$renderer) {
	Badge($$renderer, {
		variant: 'destructive',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Destructive`);
		},
		$$slots: { default: true }
	});
}