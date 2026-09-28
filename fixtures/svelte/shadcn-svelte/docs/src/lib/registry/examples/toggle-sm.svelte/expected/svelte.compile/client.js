import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ItalicIcon from "@lucide/svelte/icons/italic";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

export default function Toggle_sm($$anchor) {
	Toggle($$anchor, {
		size: 'sm',
		'aria-label': 'Toggle italic',
		children: ($$anchor, $$slotProps) => {
			ItalicIcon($$anchor, { class: 'size-4' });
		},
		$$slots: { default: true }
	});
}