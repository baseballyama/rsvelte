import * as $ from 'svelte/internal/server';
import { Center, PasswordInput } from '@svelteuidev/core';
import { EnvelopeClosed, EnvelopeOpen } from 'radix-icons-svelte';

const code = `
<script>
  import { Center, PasswordInput } from '@svelteuidev/core';
	import { EnvelopeClosed, EnvelopeOpen } from 'radix-icons-svelte';
<\/script>

<PasswordInput label="Your password">
  <svelte:fragment slot="visibilityToggleIcon" let:visible>
    {#if visible}
      <EnvelopeOpen />
    {:else}
      <EnvelopeClosed />
    {/if}
  </svelte:fragment>
</PasswordInput>
`;

export const type = 'demo';
export const configuration = { code };

export default function PasswordInput_demo_visibilityicon($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			PasswordInput($$renderer, {
				label: 'Your password',
				$$slots: {
					visibilityToggleIcon: ($$renderer, { visible }) => {
						{
							if (visible) {
								$$renderer.push('<!--[0-->');
								EnvelopeOpen($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
								EnvelopeClosed($$renderer, {});
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});
}