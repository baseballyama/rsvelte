import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Code, Center } from '@svelteuidev/core';

const code = `<script>
    import { Code } from '@svelteuidev/core';
<\/script>

<Code>This code will be inline</Code>
`;

export const type = 'demo';
export const configuration = { code };

export default function Code_demo_usage($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Code($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This code will be inline');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}