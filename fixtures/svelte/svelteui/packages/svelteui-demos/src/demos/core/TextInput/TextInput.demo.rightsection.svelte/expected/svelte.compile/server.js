import * as $ from 'svelte/internal/server';
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

export default function TextInput_demo_rightsection($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			TextInput($$renderer, {
				label: 'Your email',
				placeholder: 'Your email',
				$$slots: {
					rightSection: ($$renderer) => {
						{
							Loader($$renderer, { color: 'blue', size: 'xs' });
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});
}