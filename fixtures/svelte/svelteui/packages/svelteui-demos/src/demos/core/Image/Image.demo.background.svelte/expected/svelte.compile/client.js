import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Image_demo_background($$anchor) {
	const url = 'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&w=720&q=80';

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			BackgroundImage($$anchor, {
				src: url,
				radius: 'sm',
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {
						color: '#fff',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('BackgroundImage component can be used to add any content on image. It is useful for hero\n			headers and other similar sections');

							$.append($$anchor, text);
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