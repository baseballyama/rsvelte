import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ThemeSwitch } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Customize Switch</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			ThemeSwitch($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			ThemeSwitch($$anchor, {
				classes: {
					icon: 'text-primary-content',
					switch: 'bg-secondary w-20',
					toggle: 'bg-accent'
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}