import * as $ from 'svelte/internal/server';
import { Switch } from '@skeletonlabs/skeleton-svelte';
import { ModeWatcher, mode, setMode } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$.head('vw2t9l', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
		});

		ModeWatcher($$renderer, { defaultTheme: 'cerberus' });
		$$renderer.push(`<!----> <main class="p-4"><div class="pb-4 text-right">`);

		Switch($$renderer, {
			name: 'mode',
			checked: mode.current === 'dark',
			onCheckedChange: (e) => setMode(e.checked ? 'dark' : 'light')
		});

		$$renderer.push(`<!----></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}