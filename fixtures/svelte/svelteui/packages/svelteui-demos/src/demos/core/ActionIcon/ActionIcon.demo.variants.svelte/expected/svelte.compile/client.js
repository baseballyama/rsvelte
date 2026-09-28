import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ActionIcon, Group } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';

const code = `<script>
  import { ActionIcon } from '@svelteuidev/core';
  import { GithubLogo } from 'radix-icons-svelte';
<\/script>

<ActionIcon color='blue' variant='hover'><GithubLogo size={16} /></ActionIcon>
<ActionIcon color='blue' variant='filled'><GithubLogo size={16} /></ActionIcon>
<ActionIcon color='blue' variant='outline'><GithubLogo size={16} /></ActionIcon>
<ActionIcon color='blue' variant='light'><GithubLogo size={16} /></ActionIcon>
<ActionIcon color='blue' variant='default'><GithubLogo size={16} /></ActionIcon>
<ActionIcon color='blue' variant='transparent'><GithubLogo size={16} /></ActionIcon>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

export default function ActionIcon_demo_variants($$anchor) {
	let variants = [
		'hover',
		'filled',
		'outline',
		'light',
		'default',
		'transparent'
	];

	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => variants, $.index, ($$anchor, variant) => {
				ActionIcon($$anchor, {
					get variant() {
						return $.get(variant);
					},
					color: 'blue',
					children: ($$anchor, $$slotProps) => {
						GithubLogo($$anchor, { size: 16 });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}