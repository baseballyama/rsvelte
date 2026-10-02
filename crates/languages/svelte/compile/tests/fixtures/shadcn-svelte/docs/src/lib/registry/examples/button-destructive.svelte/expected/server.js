import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_destructive($$renderer) {
	Button($$renderer, {
		variant: 'destructive',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Destructive`);
		},
		$$slots: { default: true }
	});
}