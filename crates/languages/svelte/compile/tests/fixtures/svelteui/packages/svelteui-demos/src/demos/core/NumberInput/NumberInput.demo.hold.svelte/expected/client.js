import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, NumberInput, Stack } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Step on hold'
    description='Step the value when clicking and holding the arrows'
    stepHoldDelay={500}
    stepHoldInterval={100}
\/>

<NumberInput
    label='Step the value with interval function'
    description='Step value will increase incrementally when control is hold'
    stepHoldDelay={500}
    stepHoldInterval={(t) => Math.max(1000 / t ** 2, 25)}
\/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function NumberInput_demo_hold($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					NumberInput(node, {
						label: 'Step on hold',
						description: 'Step the value when clicking and holding the arrows',
						stepHoldDelay: 500,
						stepHoldInterval: 100,
						placeholder: 'Hold the button'
					});

					var node_1 = $.sibling(node, 2);

					NumberInput(node_1, {
						label: 'Step the value with interval function',
						description: 'Step value will increase incrementally when control is hold',
						stepHoldDelay: 500,
						stepHoldInterval: (t) => Math.max(1000 / t ** 2, 25),
						placeholder: 'Hold the button'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}