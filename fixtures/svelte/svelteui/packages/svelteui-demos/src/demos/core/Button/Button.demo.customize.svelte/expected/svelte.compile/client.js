import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function Button_demo_customize($$anchor) {
	const newStyles = {
		boxShadow: '0 2px 14px #228be6',
		transition: 'all 0.2s ease-in-out',
		color: 'white !important',
		textDecoration: 'none !important',
		'&:hover': { boxShadow: '0 4px 20px #228be6' }
	};

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				override: { bc: 'red', '&:hover': { bc: '$indigo400' } },
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click Me');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				get override() {
					return newStyles;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('I love open source!');

					$.append($$anchor, text_1);
				},

				$$slots: {
					default: true,
					leftIcon: ($$anchor, $$slotProps) => {
						GithubLogo($$anchor, { slot: 'leftIcon', size: 16 });
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}