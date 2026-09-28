import * as $ from 'svelte/internal/server';
import { Center, Blockquote } from '@svelteuidev/core';

const code = `
<script>
  import { Blockquote } from '@svelteuidev/core';

  const text = 'If you walk in the rain, you will get wet.';
<\/script>

<Blockquote icon={null}>
  {text}
  <svelte:fragment slot="cite">- A very wise sage</svelte:fragment>
</Blockquote>
`;

export const type = 'demo';
export const configuration = { code };

export default function Blockquote_demo_noicon($$renderer) {
	const text = 'If you walk in the rain, you will get wet.';

	Center($$renderer, {
		children: ($$renderer) => {
			Blockquote($$renderer, {
				icon: null,
				children: ($$renderer) => {
					$$renderer.push(`<!---->If you walk in the rain, you will get wet.`);
				},

				$$slots: {
					default: true,
					cite: ($$renderer) => {
						{
							$$renderer.push(`- A very wise sage`);
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});
}