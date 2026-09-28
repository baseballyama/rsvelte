import * as $ from 'svelte/internal/server';
import { Code } from '@svelteuidev/core';

const code = `<script>
    import { Code } from '@svelteuidev/core';
<\/script>

<Code block copy message='This code will be in block and you can copy'>
    This code will be in block and you can copy
</Code>
`;

export const type = 'demo';
export const configuration = { code };

export default function Code_demo_block($$renderer) {
	Code($$renderer, {
		block: true,
		copy: true,
		message: 'This code will be in block and you can copy',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This code will be in block and you can copy`);
		},
		$$slots: { default: true }
	});
}