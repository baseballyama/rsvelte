import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);

export default function NumberInput_demo_externalcontrols($$anchor) {
	let input;

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ActionIcon(node, {
				variant: 'default',
				$$events: { click: () => input.decrement() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('-');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Center(node_1, {
				inline: true,
				override: { width: '50px' },
				children: ($$anchor, $$slotProps) => {
					$.bind_this(
						NumberInput($$anchor, {
							hideControls: true,
							defaultValue: 0,
							max: 10,
							min: 0,
							step: 2
						}),
						($$value) => input = $$value,
						() => input
					);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ActionIcon(node_2, {
				variant: 'default',
				$$events: { click: () => input.increment() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('+');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}