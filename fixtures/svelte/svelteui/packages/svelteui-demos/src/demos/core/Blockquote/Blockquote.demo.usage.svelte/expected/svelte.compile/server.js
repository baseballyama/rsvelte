import * as $ from 'svelte/internal/server';
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

export default function Blockquote_demo_usage($$renderer) {
	const text = `Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.`;

	Center($$renderer, {
		children: ($$renderer) => {
			Blockquote($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.`);
				},

				$$slots: {
					default: true,
					cite: ($$renderer) => {
						{
							$$renderer.push(`- Corey Riffin`);
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});
}