import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Blockquote_demo_noicon($$anchor) {
	const text = 'If you walk in the rain, you will get wet.';

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Blockquote($$anchor, {
				icon: null,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'If you walk in the rain, you will get wet.';
					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					cite: ($$anchor, $$slotProps) => {
						var text_2 = $.text('- A very wise sage');

						$.append($$anchor, text_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}