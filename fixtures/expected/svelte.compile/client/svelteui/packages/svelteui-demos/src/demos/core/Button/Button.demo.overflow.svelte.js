import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
<\/script>

<Button fullSize>Click Me</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_overflow($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				fullSize: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click Me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}