import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import Hello from './Hello.svelte';
import World from './World.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Nested(node, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				Hello($$anchor, { slot: 'name' });
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Nested(node_1, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				World($$anchor, { slot: 'name' });
			}
		}
	});

	$.append($$anchor, fragment);
}