import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { Spinner } from "$lib/registry/ui/spinner/index.js";

export default function Button_loading($$renderer) {
	Button($$renderer, {
		size: 'sm',
		variant: 'outline',
		disabled: true,
		children: ($$renderer) => {
			Spinner($$renderer, {});
			$$renderer.push(`<!----> Submit`);
		},
		$$slots: { default: true }
	});
}