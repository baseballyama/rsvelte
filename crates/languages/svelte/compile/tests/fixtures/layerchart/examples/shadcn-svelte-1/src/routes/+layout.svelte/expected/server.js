import * as $ from 'svelte/internal/server';
import { ModeWatcher, mode, setMode } from 'mode-watcher';
import { Switch } from '$lib/components/ui/switch/index.js';
import '../app.css';
import favicon from '$lib/assets/favicon.svg';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$.head('z6zhu7', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
		});

		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> <main class="p-4"><div class="pb-4 text-right">`);

		Switch($$renderer, {
			checked: mode.current === 'dark',
			onCheckedChange: (checked) => setMode(checked ? 'dark' : 'light')
		});

		$$renderer.push(`<!----></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}