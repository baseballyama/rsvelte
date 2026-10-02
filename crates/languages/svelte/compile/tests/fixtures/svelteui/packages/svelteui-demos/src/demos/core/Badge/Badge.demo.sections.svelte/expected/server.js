import * as $ from 'svelte/internal/server';
import { Badge, CloseButton, Group } from '@svelteuidev/core';

const code = `<script>
  import { Badge, CloseButton } from '@svelteuidev/core';
<\/script>

<Badge>
    Badge with right section
    <svelte:fragment slot='rightSection'>
        <CloseButton size='xs' iconSize='xs' color='blue' variant='transparent' />
    </svelte:fragment>
</Badge>

<Badge>
    Badge with left section
    <svelte:fragment slot='leftSection'>
        <CloseButton size='xs' iconSize='xs' color='blue' variant='transparent' />
    </svelte:fragment>
</Badge>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

export default function Badge_demo_sections($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Badge($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Badge with right section`);
				},

				$$slots: {
					default: true,
					rightSection: ($$renderer) => {
						{
							CloseButton($$renderer, {
								size: 'xs',
								iconSize: 'xs',
								color: 'blue',
								variant: 'transparent'
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Badge with left section`);
				},

				$$slots: {
					default: true,
					leftSection: ($$renderer) => {
						{
							CloseButton($$renderer, {
								size: 'xs',
								iconSize: 'xs',
								color: 'blue',
								variant: 'transparent'
							});
						}
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}