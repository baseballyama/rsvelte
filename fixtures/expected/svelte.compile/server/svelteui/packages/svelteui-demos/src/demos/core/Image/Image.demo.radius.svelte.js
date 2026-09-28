import * as $ from 'svelte/internal/server';
import { Image, SimpleGrid } from '@svelteuidev/core';

const code = `<script>
    import { Image } from '@svelteuidev/core';
<\/script>

<Image radius={0} src={doggo} />
<Image radius={'lg'} src={doggo} />
<Image radius={10} src={doggo} />`;

export const type = 'demo';
export const configuration = { code };

export default function Image_demo_radius($$renderer) {
	const doggo = 'https://images.unsplash.com/photo-1627552245715-77d79bbf6fe2?auto=format&fit=crop&w=640&q=80';

	SimpleGrid($$renderer, {
		cols: 3,
		children: ($$renderer) => {
			Image($$renderer, { radius: 0, src: doggo });
			$$renderer.push(`<!----> `);
			Image($$renderer, { radius: 'lg', src: doggo });
			$$renderer.push(`<!----> `);
			Image($$renderer, { radius: 10, src: doggo });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}