import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';
import { GithubLogo } from 'radix-icons-svelte';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
	import { GithubLogo } from 'radix-icons-svelte';
<\/script>

<Button>
	<GithubLogo slot="leftIcon" />
	Icon on left
</Button>
<Button>
	Icon on right
	<GithubLogo slot="rightIcon" />
</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Button_demo_icons($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Icon on left`);
				},

				$$slots: {
					default: true,
					leftIcon: ($$renderer) => {
						GithubLogo($$renderer, { slot: 'leftIcon' });
					}
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Icon on right`);
				},

				$$slots: {
					default: true,
					rightIcon: ($$renderer) => {
						GithubLogo($$renderer, { slot: 'rightIcon' });
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}