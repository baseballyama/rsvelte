import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '$lib';
import Background from './Background.svelte';
import Logo from './Logo.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor) {
	Canvas($$anchor, {
		autoplay: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Logo(node, {});

			var node_1 = $.sibling(node, 2);

			Background(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}