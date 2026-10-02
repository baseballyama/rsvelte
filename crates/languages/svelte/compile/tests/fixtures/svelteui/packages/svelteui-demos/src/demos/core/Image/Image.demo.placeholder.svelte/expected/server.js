import * as $ from 'svelte/internal/server';
import { Group, Image, Text } from '@svelteuidev/core';

const code = `<script>
    import { Image, Text } from '@svelteuidev/core';
<\/script>

<Image width={200} height={120} src={null} alt='Without placeholder' />
<Image width={200} height={120} src={null} alt='With default placeholder' usePlaceholder />
<Image width={200} height={120} src={null} alt='With default placeholder' usePlaceholder>
    <svelte:fragment slot='placeholder'>
        <Text>This image would have changed your life</Text>
    </svelte:fragment>
</Image>`;

export const type = 'demo';
export const configuration = { code };

export default function Image_demo_placeholder($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Image($$renderer, {
				width: 200,
				height: 120,
				src: null,
				alt: 'Without placeholder'
			});

			$$renderer.push(`<!----> `);

			Image($$renderer, {
				width: 200,
				height: 120,
				src: null,
				alt: 'With default placeholder',
				usePlaceholder: true
			});

			$$renderer.push(`<!----> `);

			Image($$renderer, {
				width: 200,
				height: 120,
				src: null,
				alt: 'With default placeholder',
				usePlaceholder: true,
				$$slots: {
					placeholder: ($$renderer) => {
						{
							Text($$renderer, {
								align: 'center',
								children: ($$renderer) => {
									$$renderer.push(`<!---->This image would have changed your life`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}