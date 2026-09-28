import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Blockquote } from '@svelteuidev/core';

const code = `
<script>
  import { Blockquote } from '@svelteuidev/core';

  const text = \`Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.\`;
<\/script>

<Blockquote>
  {text}
  <svelte:fragment slot="cite">- Corey Riffin</svelte:fragment>
</Blockquote>
`;

export const type = 'demo';
export const configuration = { code };

export default function Blockquote_demo_usage($$anchor) {
	const text = `Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.`;

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Blockquote($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					text_1.nodeValue = 'Money is just one thing, folks. There\'s a lot of other one things that are everything. There\'s\n		also that one thing that\'s a one thing so special you\'d give every other one thing to save that\n		one thing and be lost without that one thing. And if you lost that one thing, you\'d be left with\n		nothing. A nothing so empty and cold that all the other one things will mean nothing.';
					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					cite: ($$anchor, $$slotProps) => {
						var text_2 = $.text('- Corey Riffin');

						$.append($$anchor, text_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}