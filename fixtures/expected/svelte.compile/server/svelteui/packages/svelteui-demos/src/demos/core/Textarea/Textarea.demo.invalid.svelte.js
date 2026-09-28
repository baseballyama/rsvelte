import * as $ from 'svelte/internal/server';
import { Center, Stack, Textarea } from '@svelteuidev/core';

const code = `
<script>
  import { Textarea } from '@svelteuidev/core';
<\/script>

<Textarea error label="Your story" value="Once upon a land" />
<Textarea
  error='Stories must begin with "Once upon a time"'
  label="Your story"
  value="Once upon a land"
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Textarea_demo_invalid($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				justify: 'center',
				children: ($$renderer) => {
					Textarea($$renderer, { error: true, label: 'Your story', value: 'Once upon a land' });
					$$renderer.push(`<!----> `);

					Textarea($$renderer, {
						error: `Stories must begin with "Once upon a time"`,
						label: 'Your story',
						value: 'Once upon a land'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}