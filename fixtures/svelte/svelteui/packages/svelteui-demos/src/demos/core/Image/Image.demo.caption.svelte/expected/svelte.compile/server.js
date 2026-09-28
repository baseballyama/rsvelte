import * as $ from 'svelte/internal/server';
import { Group, Image } from '@svelteuidev/core';

const code = `<script>
    import { Image } from '@svelteuidev/core';
<\/script>

<Image radius='md' src={doggo} alt='Random unsplash image' caption='My dog begging for treats' />`;

export const type = 'demo';
export const configuration = { code };

export default function Image_demo_caption($$renderer) {
	const doggo = 'https://images.unsplash.com/photo-1627552245715-77d79bbf6fe2?auto=format&fit=crop&w=640&q=80';

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Image($$renderer, {
				radius: 'md',
				src: doggo,
				alt: 'Random unsplash image',
				caption: 'My dog begging for treats'
			});
		},
		$$slots: { default: true }
	});
}