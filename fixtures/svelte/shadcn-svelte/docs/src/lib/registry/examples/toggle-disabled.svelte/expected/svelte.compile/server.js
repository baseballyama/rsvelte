import * as $ from 'svelte/internal/server';
import UnderlineIcon from "@lucide/svelte/icons/underline";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

export default function Toggle_disabled($$renderer) {
	Toggle($$renderer, {
		'aria-label': 'Toggle underline',
		disabled: true,
		children: ($$renderer) => {
			UnderlineIcon($$renderer, { class: 'size-4' });
		},
		$$slots: { default: true }
	});
}