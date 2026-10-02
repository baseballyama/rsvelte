import * as $ from 'svelte/internal/server';
import MoonIcon from "@lucide/svelte/icons/moon";
import SunIcon from "@lucide/svelte/icons/sun";
import { toggleMode } from "mode-watcher";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Dark_mode_light_switch($$renderer) {
	Button($$renderer, {
		onclick: toggleMode,
		variant: 'outline',
		size: 'icon',
		children: ($$renderer) => {
			SunIcon($$renderer, {
				class: 'h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90'
			});

			$$renderer.push(`<!----> `);

			MoonIcon($$renderer, {
				class: 'absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0'
			});

			$$renderer.push(`<!----> <span class="sr-only">Toggle theme</span>`);
		},
		$$slots: { default: true }
	});
}