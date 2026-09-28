import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Code_demo_block($$anchor) {
	Code($$anchor, {
		block: true,
		copy: true,
		message: 'This code will be in block and you can copy',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This code will be in block and you can copy');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}