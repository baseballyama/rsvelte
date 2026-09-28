import * as $ from 'svelte/internal/server';
import { Badge, Input } from '@svelteuidev/core';
import { MagnifyingGlass } from 'radix-icons-svelte';

const code = `<script>
    import { Badge, Input } from '@svelteuidev/core';
    import { MagnifyingGlass } from 'radix-icons-svelte';
<\/script>

<Input
    icon={MagnifyingGlass}
    placeholder='Search'
    rightSectionWidth={70}
    styles={{ rightSection: { pointerEvents: 'none' } }}
>
    <Badge slot='rightSection' color='blue' variant='filled'>
        new
    </Badge>
</Input>`;

export const type = 'demo';
export const configuration = { code };

export default function Input_demo_sections($$renderer) {
	Input($$renderer, {
		icon: MagnifyingGlass,
		placeholder: 'Search',
		rightSectionWidth: 70,
		styles: { rightSection: { pointerEvents: 'none' } },
		$$slots: {
			rightSection: ($$renderer) => {
				Badge($$renderer, {
					slot: 'rightSection',
					color: 'blue',
					variant: 'filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->new`);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}