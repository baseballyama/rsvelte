import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Loader, TextInput } from '@svelteuidev/core';

const code = `
<script>
    import { Loader, TextInput } from '@svelteuidev/core';
<\/script>

<TextInput
    label='Your email'
    placeholder='Your email'
>
    <svelte:fragment slot='rightSection'>
        <Loader color='blue' size='xs' />
    </svelte:fragment>
</TextInput>
`;

export const type = 'demo';
export const configuration = { code };

export default function TextInput_demo_rightsection($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			TextInput($$anchor, {
				label: 'Your email',
				placeholder: 'Your email',
				$$slots: {
					rightSection: ($$anchor, $$slotProps) => {
						Loader($$anchor, { color: 'blue', size: 'xs' });
					}
				}
			});
		},
		$$slots: { default: true }
	});
}