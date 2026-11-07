import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_secondary($$renderer) {
	Button($$renderer, {
		variant: 'secondary',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Secondary`);
		},
		$$slots: { default: true }
	});
}