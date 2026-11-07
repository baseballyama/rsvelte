import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SunIcon from "@lucide/svelte/icons/sun";
import MoonIcon from "@lucide/svelte/icons/moon";
import { toggleMode } from "mode-watcher";
import { Button } from "$lib/components/ui/button/index.js";

var root = $.from_html(`<!> <!> <span class="sr-only">Toggle theme</span>`, 1);

export default function Light_switch($$anchor, $$props) {
	let variant = $.prop($$props, 'variant', 3, "outline");

	Button($$anchor, {
		get onclick() {
			return toggleMode;
		},

		get variant() {
			return variant();
		},
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SunIcon(node, {
				class: 'rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0'
			});

			var node_1 = $.sibling(node, 2);

			MoonIcon(node_1, {
				class: 'absolute rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100'
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}