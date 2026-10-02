import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group, Image } from '@svelteuidev/core';

const code = `<script>
    import { Image } from '@svelteuidev/core';
<\/script>

<Image radius='md' src={url} alt='Random unsplash image' />`;

export const type = 'demo';
export const configuration = { code };

export default function Image_demo_usage($$anchor) {
	const url = 'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&w=720&q=80';

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			Image($$anchor, { radius: 'md', src: url, alt: 'Random unsplash image' });
		},
		$$slots: { default: true }
	});
}