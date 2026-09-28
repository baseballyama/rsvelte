import * as $ from 'svelte/internal/server';
import { Center, Blockquote } from '@svelteuidev/core';
import { EnvelopeClosed } from 'radix-icons-svelte';

const code = `
<script>
  import { Blockquote } from '@svelteuidev/core';
  import { EnvelopeClosed } from 'radix-icons-svelte';

  const text = 'Some very wise words with deep meaning, that make you wonder.';
<\/script>

<Blockquote icon={EnvelopeClosed} iconSize={32}>
  {text}
  <svelte:fragment slot="cite">- Your cat</svelte:fragment>
</Blockquote>
`;

export const type = 'demo';
export const configuration = { code };

export default function Blockquote_demo_icon($$renderer) {
	const text = 'Some very wise words with deep meaning, that make you wonder.';

	Center($$renderer, {
		children: ($$renderer) => {
			Blockquote($$renderer, {
				icon: EnvelopeClosed,
				iconSize: 32,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Some very wise words with deep meaning, that make you wonder.`);
				},

				$$slots: {
					default: true,
					cite: ($$renderer) => {
						{
							$$renderer.push(`- Your cat`);
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});
}