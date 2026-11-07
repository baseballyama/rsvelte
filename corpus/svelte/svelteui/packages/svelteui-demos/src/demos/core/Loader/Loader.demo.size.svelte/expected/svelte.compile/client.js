import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, Loader } from '@svelteuidev/core';

const code = `<script>
    import { Loader } from '@svelteuidev/core';
<\/script>

<Loader size='lg' />
<Loader size={50} />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Loader_demo_size($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Loader(node, { size: 'lg' });

			var node_1 = $.sibling(node, 2);

			Loader(node_1, { size: 50 });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}