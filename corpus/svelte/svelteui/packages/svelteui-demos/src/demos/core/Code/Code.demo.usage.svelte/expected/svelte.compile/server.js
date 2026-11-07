import * as $ from 'svelte/internal/server';
import { Code, Center } from '@svelteuidev/core';

const code = `<script>
    import { Code } from '@svelteuidev/core';
<\/script>

<Code>This code will be inline</Code>
`;

export const type = 'demo';
export const configuration = { code };

export default function Code_demo_usage($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Code($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->This code will be inline`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}