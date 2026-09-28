import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Image, SimpleGrid } from '@svelteuidev/core';

const code = `<script>
    import { Image } from '@svelteuidev/core';
<\/script>

<Image radius={0} src={doggo} />
<Image radius={'lg'} src={doggo} />
<Image radius={10} src={doggo} />`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Image_demo_radius($$anchor) {
	const doggo = 'https://images.unsplash.com/photo-1627552245715-77d79bbf6fe2?auto=format&fit=crop&w=640&q=80';

	SimpleGrid($$anchor, {
		cols: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Image(node, { radius: 0, src: doggo });

			var node_1 = $.sibling(node, 2);

			Image(node_1, { radius: 'lg', src: doggo });

			var node_2 = $.sibling(node_1, 2);

			Image(node_2, { radius: 10, src: doggo });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}