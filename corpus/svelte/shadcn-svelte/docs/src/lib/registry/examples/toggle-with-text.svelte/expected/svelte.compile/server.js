import * as $ from 'svelte/internal/server';
import ItalicIcon from "@lucide/svelte/icons/italic";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

export default function Toggle_with_text($$renderer) {
	Toggle($$renderer, {
		'aria-label': 'Toggle italic',
		children: ($$renderer) => {
			ItalicIcon($$renderer, { class: 'me-2 size-4' });
			$$renderer.push(`<!----> Italic`);
		},
		$$slots: { default: true }
	});
}