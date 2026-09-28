import * as $ from 'svelte/internal/server';
import { Center, Stack, Textarea } from '@svelteuidev/core';

const code = `
<script>
  import { Textarea } from '@svelteuidev/core';
<\/script>

<Textarea disabled label="Disabled without value" placeholder="Once upon a time" />
<Textarea disabled label="Disabled with value" value="Once upon a time in a far away kingdom" />
`;

export const type = 'demo';
export const configuration = { code };

export default function Textarea_demo_disabled($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				justify: 'center',
				children: ($$renderer) => {
					Textarea($$renderer, {
						disabled: true,
						label: 'Disabled without value',
						placeholder: 'Once upon a time'
					});

					$$renderer.push(`<!----> `);

					Textarea($$renderer, {
						disabled: true,
						label: 'Disabled with value',
						value: 'Once upon a time in a far away kingdom'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}