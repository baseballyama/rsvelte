import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Input_demo_sections($$anchor) {
	Input($$anchor, {
		get icon() {
			return MagnifyingGlass;
		},
		placeholder: 'Search',
		rightSectionWidth: 70,
		styles: { rightSection: { pointerEvents: 'none' } },
		$$slots: {
			rightSection: ($$anchor, $$slotProps) => {
				Badge($$anchor, {
					slot: 'rightSection',
					color: 'blue',
					variant: 'filled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('new');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}