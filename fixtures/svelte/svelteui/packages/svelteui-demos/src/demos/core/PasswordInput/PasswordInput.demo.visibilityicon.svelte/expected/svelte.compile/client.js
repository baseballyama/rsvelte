import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function PasswordInput_demo_visibilityicon($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			PasswordInput($$anchor, {
				label: 'Your password',
				$$slots: {
					visibilityToggleIcon: ($$anchor, $$slotProps) => {
						const visible = $.derived(() => $$slotProps.visible);
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								EnvelopeOpen($$anchor, {});
							};

							var alternate = ($$anchor) => {
								EnvelopeClosed($$anchor, {});
							};

							$.if(node, ($$render) => {
								if ($.get(visible)) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}