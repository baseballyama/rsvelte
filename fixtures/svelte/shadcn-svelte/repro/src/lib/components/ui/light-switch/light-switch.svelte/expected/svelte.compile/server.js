import * as $ from 'svelte/internal/server';
import SunIcon from "@lucide/svelte/icons/sun";
import MoonIcon from "@lucide/svelte/icons/moon";
import { toggleMode } from "mode-watcher";
import { Button } from "$lib/components/ui/button/index.js";

export default function Light_switch($$renderer, $$props) {
	let { variant = "outline" } = $$props;

	Button($$renderer, {
		onclick: toggleMode,
		variant,
		size: 'icon',
		children: ($$renderer) => {
			SunIcon($$renderer, {
				class: 'rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0'
			});

			$$renderer.push(`<!----> `);

			MoonIcon($$renderer, {
				class: 'absolute rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100'
			});

			$$renderer.push(`<!----> <span class="sr-only">Toggle theme</span>`);
		},
		$$slots: { default: true }
	});
}