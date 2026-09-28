import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { useTerminalLoop } from './terminal.svelte.js';

export default function Terminal_loop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { delay = 500, children } = $$props;
		let loopIndex = 0;
		let loopDelayTimeout = void 0;

		const onComplete = () => {
			loopDelayTimeout = setTimeout(() => loopIndex++, delay);
		};

		useTerminalLoop({ onComplete });
		onDestroy(() => clearTimeout(loopDelayTimeout));
		$$renderer.push(`<!---->`);

		{
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!---->`);
	});
}