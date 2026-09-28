import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MoonStar, Sun } from '@lucide/svelte';
import { Button } from '../ui/button/index.ts';
import { toggleMode } from 'mode-watcher';

var root = $.from_html(`<!> <!>`, 1);

export default function ToggleMode($$anchor) {
	Button($$anchor, {
		variant: 'ghost',
		size: 'icon',
		get onclick() {
			return toggleMode;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Sun(node, { class: 'block dark:hidden' });

			var node_1 = $.sibling(node, 2);

			MoonStar(node_1, { class: 'hidden dark:block' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}