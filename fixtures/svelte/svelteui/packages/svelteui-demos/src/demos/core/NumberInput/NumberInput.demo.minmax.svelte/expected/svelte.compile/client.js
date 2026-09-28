import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, NumberInput, Stack } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Your age'
    placeholder='Your age'
    description='From 0 to 120, step is 1'
    min={0}
    max={120}
\/>
<NumberInput
    label='Your weight in kg'
    placeholder='Your weight'
    description='From 0 to infinity, step is 5'
    min={0}
    step={5}
\/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function NumberInput_demo_minmax($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					NumberInput(node, {
						label: 'Your age',
						placeholder: 'Your age',
						description: 'From 0 to 120, step is 1',
						min: 0,
						max: 120
					});

					var node_1 = $.sibling(node, 2);

					NumberInput(node_1, {
						label: 'Your weight in kg',
						placeholder: 'Your weight',
						description: 'From 0 to infinity, step is 5',
						min: 0,
						step: 5
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}