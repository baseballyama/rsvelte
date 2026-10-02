import * as $ from 'svelte/internal/server';
import CircleFadingArrowUpIcon from "@lucide/svelte/icons/circle-fading-arrow-up";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_icon($$renderer) {
	Button($$renderer, {
		variant: 'outline',
		size: 'icon',
		'aria-label': 'Submit',
		children: ($$renderer) => {
			CircleFadingArrowUpIcon($$renderer, {});
		},
		$$slots: { default: true }
	});
}