import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Usage($$anchor) {
	let scrollLocked = false;

	{
		let $0 = $.derived(() => [[lockscroll, scrollLocked]]);

		Group($$anchor, {
			position: 'center',
			get use() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					variant: 'outline',
					$$events: { click: () => scrollLocked = !scrollLocked },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, scrollLocked ? 'Unlock scroll' : 'Lock scroll'));
						$.append($$anchor, text);
					},

					$$slots: {
						default: true,
						leftIcon: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							$.component(node, () => scrollLocked ? LockClosed : LockOpen2, ($$anchor, $$component) => {
								$$component($$anchor, { slot: 'leftIcon' });
							});

							$.append($$anchor, fragment_3);
						}
					}
				});
			},
			$$slots: { default: true }
		});
	}
}