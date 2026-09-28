import * as $ from 'svelte/internal/server';
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

export default function ActionIcon_demo_variants($$renderer) {
	let variants = [
		'hover',
		'filled',
		'outline',
		'light',
		'default',
		'transparent'
	];

	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(variants);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let variant = each_array[$$index];

				ActionIcon($$renderer, {
					variant,
					color: 'blue',
					children: ($$renderer) => {
						GithubLogo($$renderer, { size: 16 });
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}