import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_default($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button`);
		},
		$$slots: { default: true }
	});
}