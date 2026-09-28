import * as $ from 'svelte/internal/server';
import { Center, Loader, Textarea } from '@svelteuidev/core';

const code = `
<script>
  import { Loader, Textarea } from '@svelteuidev/core';
<\/script>

<Textarea label="Your story" placeholder="Once upon a time">
  <svelte:fragment slot="rightSection">
    <Loader color="blue" size="xs" />
  </svelte:fragment>
</Textarea>
`;

export const type = 'demo';
export const configuration = { code };

export default function Textarea_demo_rightsection($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Textarea($$renderer, {
				label: 'Your story',
				placeholder: 'Once upon a time',
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