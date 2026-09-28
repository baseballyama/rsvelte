import * as $ from 'svelte/internal/server';
import { Clipboard } from "$lib";

export default function Basic_clipboard_test($$renderer) {
	Clipboard($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span data-testid="child"></span>`);
		},
		$$slots: { default: true }
	});
}