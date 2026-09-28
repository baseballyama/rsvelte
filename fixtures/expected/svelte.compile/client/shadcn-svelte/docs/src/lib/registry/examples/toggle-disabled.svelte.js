import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UnderlineIcon from "@lucide/svelte/icons/underline";
import { Toggle } from "$lib/registry/ui/toggle/index.js";

export default function Toggle_disabled($$anchor) {
	Toggle($$anchor, {
		'aria-label': 'Toggle underline',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			UnderlineIcon($$anchor, { class: 'size-4' });
		},
		$$slots: { default: true }
	});
}