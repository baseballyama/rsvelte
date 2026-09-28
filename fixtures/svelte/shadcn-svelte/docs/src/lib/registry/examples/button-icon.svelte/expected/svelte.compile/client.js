import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CircleFadingArrowUpIcon from "@lucide/svelte/icons/circle-fading-arrow-up";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_icon($$anchor) {
	Button($$anchor, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Submit',
		children: ($$anchor, $$slotProps) => {
			CircleFadingArrowUpIcon($$anchor, {});
		},
		$$slots: { default: true }
	});
}