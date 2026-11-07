import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Badge_secondary($$renderer) {
	Badge($$renderer, {
		variant: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary`);
		},
		$$slots: { default: true }
	});
}