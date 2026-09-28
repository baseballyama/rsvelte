import * as $ from 'svelte/internal/server';
import { Kbd, TextInput, Box } from '@svelteuidev/core';
import { MagnifyingGlass } from 'radix-icons-svelte';

const code = `
<script>
  import { Kbd, TextInput } from '@svelteuidev/core';
  import { MagnifyingGlass } from 'radix-icons-svelte';
<\/script>

<TextInput
  placeholder="Search"
  icon={MagnifyingGlass}
  rightSectionWidth={90}
>
  <svelte:fragment slot='rightSection'>
    <Kbd>Ctrl</Kbd>
    <Box root='span'>+</Box>
    <Kbd>K</Kbd>
  </svelte:fragment>
</TextInput>`;

export const type = 'demo';
export const configuration = { code };

export default function Kbd_demo_example($$renderer) {
	TextInput($$renderer, {
		placeholder: 'Search',
		icon: MagnifyingGlass,
		rightSectionWidth: 90,
		override: { '&. rightSection': { pointerEvents: 'none' } },
		$$slots: {
			rightSection: ($$renderer) => {
				{
					Kbd($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Ctrl`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Box($$renderer, {
						root: 'span',
						css: { m: '0 5px' },
						children: ($$renderer) => {
							$$renderer.push(`<!---->+`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Kbd($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->K`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				}
			}
		}
	});
}