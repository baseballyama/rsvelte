import * as $ from 'svelte/internal/server';
import { ModeWatcher, mode, toggleMode } from 'mode-watcher';
import '../app.css';
import favicon from '$lib/assets/favicon.svg';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		$.head('1m92y7r', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
		});

		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> <main class="p-4"><div class="pb-4 text-right"><button>${$.escape(mode.current === 'dark' ? '🌞' : '🌙')} Toggle mode</button></div> `);
		children?.($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}