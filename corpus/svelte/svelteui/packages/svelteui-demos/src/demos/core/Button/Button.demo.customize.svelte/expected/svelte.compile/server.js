import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';

const code = `
<script>
    import { Button } from '@svelteuidev/core';

    const newStyles = {
        boxShadow: '0 2px 14px #228be6',
        transition: 'all 0.2s ease-in-out',
        color: 'white !important',
        textDecoration: 'none !important',
        '&:hover': {
        boxShadow: '0 4px 20px #228be6',
        },
    };
<\/script>

<Button override={{ bc: 'red', '&:hover': { bc: '$indigo400' } }} variant='outline'>Click Me</Button>
<Button override={newStyles}>
    <GithubLogo slot='leftIcon' size={16} /> I love open source!
</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_customize($$renderer) {
	const newStyles = {
		boxShadow: '0 2px 14px #228be6',
		transition: 'all 0.2s ease-in-out',
		color: 'white !important',
		textDecoration: 'none !important',
		'&:hover': { boxShadow: '0 4px 20px #228be6' }
	};

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				override: { bc: 'red', '&:hover': { bc: '$indigo400' } },
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click Me`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				override: newStyles,
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}