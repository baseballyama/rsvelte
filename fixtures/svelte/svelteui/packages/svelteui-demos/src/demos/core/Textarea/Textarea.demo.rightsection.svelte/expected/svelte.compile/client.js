import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Textarea_demo_rightsection($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Textarea($$anchor, {
				label: 'Your story',
				placeholder: 'Once upon a time',
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