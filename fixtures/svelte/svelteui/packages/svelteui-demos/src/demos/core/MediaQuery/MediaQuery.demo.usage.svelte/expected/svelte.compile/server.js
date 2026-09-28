import * as $ from 'svelte/internal/server';
import { MediaQuery, Text } from '@svelteuidev/core';

const code = `
<script>
	import { MediaQuery, Text } from '@svelteuidev/core';
<\/script>

<MediaQuery
	query="(max-width: 1200px) and (min-width: 800px)"
	styles={{ bc: '$blue50', p: '$10' }}
>
	<Text>(max-width: 1200px) and (min-width: 800px) breakpoints</Text>
</MediaQuery>
`;

export const type = 'demo';
export const configuration = { code };

export default function MediaQuery_demo_usage($$renderer) {
	MediaQuery($$renderer, {
		query: '(max-width: 1200px) and (min-width: 800px)',
		styles: { bc: '$blue50', p: '$10' },
		children: ($$renderer) => {
			Text($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->(max-width: 1200px) and (min-width: 800px) breakpoints`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}