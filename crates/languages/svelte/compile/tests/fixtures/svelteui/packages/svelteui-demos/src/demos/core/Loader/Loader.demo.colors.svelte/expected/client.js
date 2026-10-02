import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader color='red' />
<Loader color='green' />
<Loader color='teal' />
<Loader color='gray' />
<Loader color='blue' />
<Loader color='yellow' />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Loader_demo_colors($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Loader(node, { color: 'red' });

			var node_1 = $.sibling(node, 2);

			Loader(node_1, { color: 'green' });

			var node_2 = $.sibling(node_1, 2);

			Loader(node_2, { color: 'teal' });

			var node_3 = $.sibling(node_2, 2);

			Loader(node_3, { color: 'gray' });

			var node_4 = $.sibling(node_3, 2);

			Loader(node_4, { color: 'blue' });

			var node_5 = $.sibling(node_4, 2);

			Loader(node_5, { color: 'yellow' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}