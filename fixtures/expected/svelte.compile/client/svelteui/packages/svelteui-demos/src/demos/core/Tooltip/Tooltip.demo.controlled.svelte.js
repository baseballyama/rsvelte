import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Center, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';

  let opened = false;
<\/script>

<Tooltip {opened} label='Hello'>
    <Button on:click={() => (opened = !opened)}>Click here</Button>
</Tooltip>
`;

export const type = 'demo';
export const configuration = { code };

export default function Tooltip_demo_controlled($$anchor) {
	let opened = false;

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				get opened() {
					return opened;
				},
				label: 'Hello',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						$$events: { click: () => opened = !opened },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Click here');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}