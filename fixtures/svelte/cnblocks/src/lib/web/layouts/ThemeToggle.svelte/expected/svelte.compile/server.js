import * as $ from 'svelte/internal/server';
import Button from "$lib/components/ui/button/button.svelte";
import { mode, toggleMode } from "mode-watcher";

export default function ThemeToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Button($$renderer, {
			onclick: toggleMode,
			class: 'cursor-pointer rounded-full',
			variant: 'ghost',
			size: 'icon',
			children: ($$renderer) => {
				if (mode.current === "light") {
					$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-[1.2rem] w-[1.2rem]"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`);
				} else {
					$$renderer.push(`<!--[-1--><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-[1.2rem] w-[1.2rem]"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`);
				}

				$$renderer.push(`<!--]--> <span class="sr-only">Toggle theme</span>`);
			},
			$$slots: { default: true }
		});
	});
}