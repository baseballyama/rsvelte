import * as $ from 'svelte/internal/server';
import ItalicIcon from "@lucide/svelte/icons/italic";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

export default function Toggle_outline($$renderer) {
	Toggle($$renderer, {
		variant: 'outline',
		'aria-label': 'Toggle italic',
		children: ($$renderer) => {
			ItalicIcon($$renderer, { class: 'size-4' });
		},
		$$slots: { default: true }
	});
}