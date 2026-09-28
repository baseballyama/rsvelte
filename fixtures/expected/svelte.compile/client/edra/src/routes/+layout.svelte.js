import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher } from 'mode-watcher';
import './layout.css';
import { Toaster } from '$lib/components/ui/sonner/index.js';
import { TooltipProvider } from '$lib/components/ui/tooltip/index.js';
import Search from '$lib/components/custom/docs/Search.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var node_1 = $.sibling(node, 2);

	Toaster(node_1, { richColors: true, closeButton: true });

	var node_2 = $.sibling(node_1, 2);

	Search(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	TooltipProvider(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			$.snippet(node_4, () => $$props.children);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}