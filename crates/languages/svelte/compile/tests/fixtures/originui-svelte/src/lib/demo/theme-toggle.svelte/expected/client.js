import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RiMoonClearLine from '~icons/ri/moon-clear-line';
import RiSunLine from '~icons/ri/sun-line';
import { mode, setMode } from 'mode-watcher';

var root = $.from_html(`<div class="flex flex-col justify-center"><input type="checkbox" name="theme-toggle" id="theme-toggle" class="peer sr-only" aria-label="Toggle dark mode"/> <label class="text-muted-foreground peer-focus-visible:outline-ring/70 relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-solid" for="theme-toggle" aria-hidden="true"><!> <!> <span class="sr-only">Switch to light / dark version</span></label></div>`);

export default function Theme_toggle($$anchor, $$props) {
	$.push($$props, true);

	const $mode = () => $.store_get(mode, '$mode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function handleModeChange() {
		if ($mode() === 'light') {
			setMode('dark');
		} else {
			setMode('light');
		}
	}

	var div = root();
	var input = $.child(div);

	$.remove_input_defaults(input);

	var label = $.sibling(input, 2);
	var node = $.child(label);

	RiSunLine(node, { class: 'size-5 dark:hidden', 'aria-hidden': 'true' });

	var node_1 = $.sibling(node, 2);

	RiMoonClearLine(node_1, { class: 'hidden size-5 dark:block', 'aria-hidden': 'true' });
	$.next(2);
	$.reset(label);
	$.reset(div);
	$.template_effect(() => $.set_checked(input, $mode() === 'light'));
	$.delegated('change', input, handleModeChange);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['change']);