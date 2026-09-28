import * as $ from 'svelte/internal/server';
import { BackgroundImage, Group, Text } from '@svelteuidev/core';

const code = `<script>
    import { BackgroundImage, Text } from '@svelteuidev/core';
<\/script>

<BackgroundImage src={url} radius='sm' >
    <Text color='#fff'>
        BackgroundImage component can be used to add any content on image. It is useful for hero
        headers and other similar sections
    </Text>
</BackgroundImage>`;

export const type = 'demo';
export const configuration = { code };

export default function Image_demo_background($$renderer) {
	const url = 'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&w=720&q=80';

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			BackgroundImage($$renderer, {
				src: url,
				radius: 'sm',
				children: ($$renderer) => {
					Text($$renderer, {
						color: '#fff',
						children: ($$renderer) => {
							$$renderer.push(`<!---->BackgroundImage component can be used to add any content on image. It is useful for hero
			headers and other similar sections`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}