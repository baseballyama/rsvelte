import * as $ from 'svelte/internal/server';
import { Button } from "bits-ui";
import { mode, toggleMode } from "mode-watcher";
import { scale } from "svelte/transition";
import { cubicOut } from "svelte/easing";
import Moon from "phosphor-svelte/lib/Moon";
import Sun from "phosphor-svelte/lib/Sun";

export default function Light_switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Button.Root) {
			$$renderer.push('<!--[-->');

			Button.Root($$renderer, {
				onclick: toggleMode,
				role: 'switch',
				'aria-label': 'Light Switch',
				'aria-checked': mode.current === "light",
				title: `Toggle ${mode.current === 'dark' ? 'Dark' : 'Light'} Mode`,
				class: 'rounded-input hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex h-10 w-10 cursor-pointer items-center justify-center px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
				children: ($$renderer) => {
					if (mode.current === "light") {
						$$renderer.push(`<!--[0--><div class="absolute inline-flex h-full w-full items-center justify-center">`);
						Moon($$renderer, { class: 'size-6', 'aria-label': 'Moon' });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="absolute inline-flex h-full w-full items-center justify-center">`);
						Sun($$renderer, { class: 'size-6', 'aria-label': 'Sun' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}