import * as $ from 'svelte/internal/server';
import { MoonStar, Sun } from '@lucide/svelte';
import { Button } from '../ui/button/index.ts';
import { toggleMode } from 'mode-watcher';

export default function ToggleMode($$renderer) {
	Button($$renderer, {
		variant: 'ghost',
		size: 'icon',
		onclick: toggleMode,
		children: ($$renderer) => {
			Sun($$renderer, { class: 'block dark:hidden' });
			$$renderer.push(`<!----> `);
			MoonStar($$renderer, { class: 'hidden dark:block' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}