import * as $ from 'svelte/internal/server';
import { Group, Image } from '@svelteuidev/core';

const code = `<script>
    import { Image } from '@svelteuidev/core';
<\/script>

<Image width={200} height={80} src={url} />
<Image width={200} height={80} fit='contain' src={url} />
<Image height={80} src={url} />`;

export const type = 'demo';
export const configuration = { code };

export default function Image_demo_width($$renderer) {
	const url = 'https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&w=720&q=80';

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Image($$renderer, { width: 200, height: 80, src: url });
			$$renderer.push(`<!----> `);
			Image($$renderer, { width: 200, height: 80, fit: 'contain', src: url });
			$$renderer.push(`<!----> `);
			Image($$renderer, { height: 80, src: url });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}