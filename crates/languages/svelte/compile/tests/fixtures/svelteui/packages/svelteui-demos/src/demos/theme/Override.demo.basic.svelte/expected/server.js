import * as $ from 'svelte/internal/server';
import { Button, Center } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';

const code = `
<script>
  import { Button } from '@svelteuidev/core';
  import { GithubLogo } from 'radix-icons-svelte';

  const PrimaryButton = {
    $$blue: '#228be6',
    boxShadow: '0 2px 14px $$blue',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: '0 4px 20px $$blue'
    }
  };
<\/script>

<Button override={PrimaryButton}>
	<GithubLogo slot="leftIcon" size={16} /> I love open source!
</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Override_demo_basic($$renderer) {
	const PrimaryButton = {
		$$blue: '#228be6',
		boxShadow: '0 2px 14px $$blue',
		transition: 'all 0.2s ease-in-out',
		'&:hover': { boxShadow: '0 4px 20px $$blue' }
	};

	Center($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				override: PrimaryButton,
				children: ($$renderer) => {
					$$renderer.push(`<!---->I love open source!`);
				},

				$$slots: {
					default: true,
					leftIcon: ($$renderer) => {
						GithubLogo($$renderer, { slot: 'leftIcon', size: 16 });
					}
				}
			});
		},
		$$slots: { default: true }
	});
}