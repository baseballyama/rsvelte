import * as $ from 'svelte/internal/server';
import { Badge, Box, Group } from '@svelteuidev/core';

const code = `<script>
  import { Badge, Box } from '@svelteuidev/core';
<\/script>

<Box>
    <Badge variant="filled" fullWidth>
        Full width badge
    </Badge>
</Box>

<Box>
    <Badge variant="filled" fullWidth>
        Badge with overflow
    </Badge>
</Box>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

export default function Badge_demo_width($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Box($$renderer, {
				css: { width: 200 },
				children: ($$renderer) => {
					Badge($$renderer, {
						variant: 'filled',
						fullWidth: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Full width badge`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Box($$renderer, {
				css: { width: 120 },
				children: ($$renderer) => {
					Badge($$renderer, {
						variant: 'filled',
						fullWidth: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Badge with overflow`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}