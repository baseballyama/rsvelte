import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Blockquote_demo_icon($$anchor) {
	const text = 'Some very wise words with deep meaning, that make you wonder.';

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Blockquote($$anchor, {
				get icon() {
					return EnvelopeClosed;
				},
				iconSize: 32,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'Some very wise words with deep meaning, that make you wonder.';
					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					cite: ($$anchor, $$slotProps) => {
						var text_2 = $.text('- Your cat');

						$.append($$anchor, text_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}