import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function MediaQuery_demo_usage($$anchor) {
	MediaQuery($$anchor, {
		query: '(max-width: 1200px) and (min-width: 800px)',
		styles: { bc: '$blue50', p: '$10' },
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('(max-width: 1200px) and (min-width: 800px) breakpoints');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}