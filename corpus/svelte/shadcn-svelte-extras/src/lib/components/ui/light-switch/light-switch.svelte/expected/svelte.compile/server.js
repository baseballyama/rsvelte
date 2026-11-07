import * as $ from 'svelte/internal/server';
import SunIcon from '@lucide/svelte/icons/sun';
import MoonIcon from '@lucide/svelte/icons/moon';
import { toggleMode } from 'mode-watcher';
import Button, { sizeMap } from '$lib/components/button.svelte';

export default function Light_switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { variant = 'outline', size = 'default' } = $$props;

		Button($$renderer, {
			onclick: toggleMode,
			variant,
			size: sizeMap[size].icon,
			children: ($$renderer) => {
				SunIcon($$renderer, {
					class: 'scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90'
				});

				$$renderer.push(`<!----> `);

				MoonIcon($$renderer, {
					class: 'absolute scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0'
				});

				$$renderer.push(`<!----> <span class="sr-only">Toggle theme</span>`);
			},
			$$slots: { default: true }
		});
	});
}