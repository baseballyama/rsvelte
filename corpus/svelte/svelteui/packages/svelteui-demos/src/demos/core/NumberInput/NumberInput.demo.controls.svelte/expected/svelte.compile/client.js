import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, NumberInput, Stack } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput label='By default controls are visible' placeholder='Visible'\/>

<NumberInput
    label='Disable with hideControls prop'
    placeholder='Disable with hideControls prop'
    hideControls
\/>

<NumberInput
    label='Controls also not rendered when input is disabled'
    placeholder='Disabled'
    disabled
\/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function NumberInput_demo_controls($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					NumberInput(node, {
						label: 'By default controls are visible',
						placeholder: 'Visible'
					});

					var node_1 = $.sibling(node, 2);

					NumberInput(node_1, {
						label: 'Disable with hideControls prop',
						placeholder: 'Disabled with hideControls prop',
						hideControls: true
					});

					var node_2 = $.sibling(node_1, 2);

					NumberInput(node_2, {
						label: 'Controls also not rendered when input is disabled',
						placeholder: 'Disabled',
						disabled: true
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}