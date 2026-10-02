import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
<\/script>

<Button href="https://github.com/svelteuidev/svelteui">I go to svelteuidev/svelteui</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_root($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				href: 'https://github.com/svelteuidev/svelteui',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('I go to svelteuidev/svelteui');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}