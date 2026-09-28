import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_outline($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Outline`);
		},
		$$slots: { default: true }
	});
}