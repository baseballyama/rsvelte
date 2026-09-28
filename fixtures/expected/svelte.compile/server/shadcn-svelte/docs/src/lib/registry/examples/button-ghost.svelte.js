import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_ghost($$renderer) {
	Button($$renderer, {
		variant: 'ghost',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Ghost`);
		},
		$$slots: { default: true }
	});
}