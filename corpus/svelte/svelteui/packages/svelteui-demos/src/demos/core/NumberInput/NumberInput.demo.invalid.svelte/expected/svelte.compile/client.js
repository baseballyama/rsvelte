import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Stack, NumberInput } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput error label='Your age' defaultValue={19} \/>
<NumberInput error='You must be at least 18' label='Your age' defaultValue={16} \/>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function NumberInput_demo_invalid($$anchor) {
	let value;

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					NumberInput(node, { error: true, label: 'Your age', defaultValue: 19 });

					var node_1 = $.sibling(node, 2);

					{
						let $0 = $.derived(() => value < 18 ? 'You must be at least 18' : null);

						NumberInput(node_1, {
							get error() {
								return $.get($0);
							},
							label: 'Your age',
							defaultValue: 16,
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
							}
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}