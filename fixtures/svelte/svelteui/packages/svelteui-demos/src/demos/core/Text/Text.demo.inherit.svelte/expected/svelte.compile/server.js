import * as $ from 'svelte/internal/server';
import { Center, Text, Title } from '@svelteuidev/core';

const code = `<script>
	import { Center, Text, Title } from '@svelteuidev/core';
<\/script>

<Title order={3}>
    Highlight{' '}
    <Text color="blue" inherit component="span">
        something
    </Text>
    in title
</Title>`;

export const type = 'demo';
export const configuration = { code };

export default function Text_demo_inherit($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Title($$renderer, {
				order: 3,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Highlight  `);

					Text($$renderer, {
						color: 'blue',
						inherit: true,
						root: 'span',
						children: ($$renderer) => {
							$$renderer.push(`<!---->something`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> in title`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}