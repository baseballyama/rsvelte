import * as $ from 'svelte/internal/server';
import { lockscroll } from '@svelteuidev/composables';
import { Button, Group } from '@svelteuidev/core';
import { LockClosed, LockOpen2 } from 'radix-icons-svelte';

const code = `
<script>
	import { lockscroll } from '@svelteuidev/composables';
	import { Button, Group } from '@svelteuidev/core';
	import { LockClosed, LockOpen2 } from 'radix-icons-svelte';

	let scrollLocked = false;
<\/script>

<Group position="center" use={[[lockscroll, scrollLocked]]}>
	<Button on:click={() => (scrollLocked = !scrollLocked)} variant="outline">
		<svelte:component this={scrollLocked ? LockClosed : LockOpen2} slot="leftIcon" />
		{scrollLocked ? 'Unlock scroll' : 'Lock scroll'}
	</Button>
</Group>
`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer) {
	let scrollLocked = false;

	Group($$renderer, {
		position: 'center',
		use: [[lockscroll, scrollLocked]],
		children: ($$renderer) => {
			Button($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(scrollLocked ? 'Unlock scroll' : 'Lock scroll')}`);
				},

				$$slots: {
					default: true,
					leftIcon: ($$renderer) => {
						if (scrollLocked ? LockClosed : LockOpen2) {
							$$renderer.push('<!--[-->');
							(scrollLocked ? LockClosed : LockOpen2)($$renderer, { slot: 'leftIcon' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});
}