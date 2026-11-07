import * as $ from 'svelte/internal/server';
import { fly } from 'svelte/transition';
import { Affix, Button, Text } from '@svelteuidev/core';
import { ArrowUp } from 'radix-icons-svelte';

const code = `
<script>
  import { fly } from 'svelte/transition';
	import { Affix, Button, Text } from '@svelteuidev/core';
	import { ArrowUp } from 'radix-icons-svelte';

  let scrollY = 0;
<\/script>

<svelte:window on:scroll={() => scrollY = window.scrollY } />

<Text align="center">Affix is located at the bottom of the screen, scroll to see it</Text>
<Affix position={{ bottom: 20, right: 20 }}>
    {#if scrollY > 0}
        <div transition:fly={{ y: 20, duration: 250 }}>
            <Button on:click={() => window.scrollTo(0, 0)}>
                <svelte:fragment slot='leftIcon'>
                    <ArrowUp />
                </svelte:fragment>
                Scroll to top
            </Button>
        </div>
    {/if}
</Affix>`;

export const type = 'demo';
export const configuration = { code };

export default function Affix_demo_usage($$renderer) {
	let scrollY = 0;

	Text($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Affix is located at the bottom of the screen, scroll to see it`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Affix($$renderer, {
		position: { bottom: 20, right: 20 },
		children: ($$renderer) => {
			if (scrollY > 0) {
				$$renderer.push(`<!--[0--><div>`);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Scroll to top`);
					},

					$$slots: {
						default: true,
						leftIcon: ($$renderer) => {
							{
								ArrowUp($$renderer, {});
							}
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}