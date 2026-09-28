import * as $ from 'svelte/internal/server';
import { ModeWatcher, mode, setMode, setTheme } from 'mode-watcher';
import favicon from '$lib/assets/favicon.svg';
import '../app.css';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$.head('6phcou', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
		});

		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> <main class="p-4"><div class="pb-4 text-right"><input type="checkbox"${$.attr('checked', mode.current === 'dark', true)} class="toggle"/></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}