import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_link($$renderer) {
	Button($$renderer, {
		variant: 'link',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Link`);
		},
		$$slots: { default: true }
	});
}