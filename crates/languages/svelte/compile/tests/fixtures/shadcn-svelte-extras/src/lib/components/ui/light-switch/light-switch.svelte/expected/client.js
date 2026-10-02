import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SunIcon from '@lucide/svelte/icons/sun';
import MoonIcon from '@lucide/svelte/icons/moon';
import { toggleMode } from 'mode-watcher';
import Button, { sizeMap } from '$lib/components/button.svelte';

var root = $.from_html(`<!> <!> <span class="sr-only">Toggle theme</span>`, 1);

export default function Light_switch($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, 'outline'),
		size = $.prop($$props, 'size', 3, 'default');

	Button($$anchor, {
		get onclick() {
			return toggleMode;
		},

		get variant() {
			return variant();
		},

		get size() {
			return sizeMap[size()].icon;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SunIcon(node, {
				class: 'scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90'
			});

			var node_1 = $.sibling(node, 2);

			MoonIcon(node_1, {
				class: 'absolute scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0'
			});

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}