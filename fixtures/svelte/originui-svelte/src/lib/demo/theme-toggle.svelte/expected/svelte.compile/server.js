import * as $ from 'svelte/internal/server';
import RiMoonClearLine from '~icons/ri/moon-clear-line';
import RiSunLine from '~icons/ri/sun-line';
import { mode, setMode } from 'mode-watcher';

export default function Theme_toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function handleModeChange() {
			if ($.store_get($$store_subs ??= {}, '$mode', mode) === 'light') {
				setMode('dark');
			} else {
				setMode('light');
			}
		}

		$$renderer.push(`<div class="flex flex-col justify-center"><input type="checkbox" name="theme-toggle" id="theme-toggle" class="peer sr-only"${$.attr('checked', $.store_get($$store_subs ??= {}, '$mode', mode) === 'light', true)} aria-label="Toggle dark mode"/> <label class="text-muted-foreground peer-focus-visible:outline-ring/70 relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-solid" for="theme-toggle" aria-hidden="true">`);
		RiSunLine($$renderer, { class: 'size-5 dark:hidden', 'aria-hidden': 'true' });
		$$renderer.push(`<!----> `);
		RiMoonClearLine($$renderer, { class: 'hidden size-5 dark:block', 'aria-hidden': 'true' });
		$$renderer.push(`<!----> <span class="sr-only">Switch to light / dark version</span></label></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}