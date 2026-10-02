import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NativeSelect } from '@svelteuidev/core';
import { ChevronDown } from 'radix-icons-svelte';

const code = `<script>
    import { NativeSelect } from '@svelteuidev/core';
    import { ChevronDown } from 'radix-icons-svelte';
<\/script>

<NativeSelect
	data={['Svelte', 'Vue', 'Angular', 'React']}
	label="Select your favorite framework/library"
>
  <svelte:component slot="rightSection" this={ChevronDown} />
</NativeSelect>
`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_section($$anchor) {
	NativeSelect($$anchor, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		label: 'Select your favorite framework/library',
		$$slots: {
			rightSection: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.component(node, () => ChevronDown, ($$anchor, $$component) => {
					$$component($$anchor, { slot: 'rightSection' });
				});

				$.append($$anchor, fragment_1);
			}
		}
	});
}