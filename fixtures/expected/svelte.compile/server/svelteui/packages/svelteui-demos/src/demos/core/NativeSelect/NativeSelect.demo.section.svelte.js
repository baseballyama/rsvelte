import * as $ from 'svelte/internal/server';
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

export default function NativeSelect_demo_section($$renderer) {
	NativeSelect($$renderer, {
		data: ['Svelte', 'Vue', 'Angular', 'React'],
		label: 'Select your favorite framework/library',
		$$slots: {
			rightSection: ($$renderer) => {
				if (ChevronDown) {
					$$renderer.push('<!--[-->');
					ChevronDown($$renderer, { slot: 'rightSection' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}
	});
}