import * as $ from 'svelte/internal/server';
import { Paper, Text } from '@svelteuidev/core';
import { io } from '@svelteuidev/composables';

const code = `
<script>
	import { Paper, Text } from '@svelteuidev/core';
	import { io } from '@svelteuidev/composables';

	let visible;
	const handleChange = ({ detail }) => (visible = detail.inView);
<\/script>

<Paper override={{ overflowY: 'scroll', h: 300 }}>
	<div style="padding-top: 260px; padding-bottom: 280px;">
		<div use:io={{ threshold: 1 }} on:change={handleChange}>
			<Paper override={{ bc: visible ? '$green900' : '$red900', minW: '50%' }} padding="xl">
				<Text override={{ color: 'white' }} weight="extrabold">
					{visible ? 'Fully visible' : 'Obscured'}
				</Text>
			</Paper>
		</div>
	</div>
</Paper>
`;

export const type = 'demo';
export const configuration = { code, spacing: false };

export default function Usage($$renderer) {
	let visible;
	const handleChange = ({ detail }) => visible = detail.inView;

	Paper($$renderer, {
		override: { overflowY: 'scroll', h: 300 },
		children: ($$renderer) => {
			$$renderer.push(`<div style="padding-top: 260px; padding-bottom: 280px;"><div>`);

			Paper($$renderer, {
				override: { bc: visible ? '$green900' : '$red900', minW: '50%' },
				padding: 'xl',
				children: ($$renderer) => {
					Text($$renderer, {
						override: { color: 'white' },
						weight: 'extrabold',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(visible ? 'Fully visible' : 'Obscured')}`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}