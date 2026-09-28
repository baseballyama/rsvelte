import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, Image } from '@svelteuidev/core';

const code = `<script>
    import { Image } from '@svelteuidev/core';
<\/script>

<Image width={200} height={80} src={url} />
<Image width={200} height={80} fit='contain' src={url} />
<Image height={80} src={url} />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Image_demo_width($$anchor) {
	const url = 'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&w=720&q=80';

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Image(node, { width: 200, height: 80, src: url });

			var node_1 = $.sibling(node, 2);

			Image(node_1, { width: 200, height: 80, fit: 'contain', src: url });

			var node_2 = $.sibling(node_1, 2);

			Image(node_2, { height: 80, src: url });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}