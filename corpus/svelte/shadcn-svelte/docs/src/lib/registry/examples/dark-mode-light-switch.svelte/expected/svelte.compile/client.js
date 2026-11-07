import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MoonIcon from "@lucide/svelte/icons/moon";
import SunIcon from "@lucide/svelte/icons/sun";
import { toggleMode } from "mode-watcher";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <span class="sr-only">Toggle theme</span>`, 1);

export default function Dark_mode_light_switch($$anchor) {
	Button($$anchor, {
		get onclick() {
			return toggleMode;
		},
		variant: 'outline',
		size: 'icon',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SunIcon(node, {
				class: 'h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90'
			});

			var node_1 = $.sibling(node, 2);

			MoonIcon(node_1, {
				class: 'absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0'
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}