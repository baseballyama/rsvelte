import * as $ from 'svelte/internal/server';
import { ActionIcon, Group, NumberInput, Center } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';

    let input;
<\/script>

<ActionIcon
    variant='default'
    on:click={() => input.decrement()}
>
    -
<\/ActionIcon>
<NumberInput
    bind:this={input}
    hideControls
    defaultValue={0}
    max={10}
    min={0}
    step={2}
\/>
<ActionIcon
    variant='default'
    on:click={() => input.increment()}
>
    +
<\/ActionIcon>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_externalcontrols($$renderer) {
	let input;

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			ActionIcon($$renderer, {
				variant: 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->-`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Center($$renderer, {
				inline: true,
				override: { width: '50px' },
				children: ($$renderer) => {
					NumberInput($$renderer, {
						hideControls: true,
						defaultValue: 0,
						max: 10,
						min: 0,
						step: 2
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ActionIcon($$renderer, {
				variant: 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->+`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}