import * as $ from 'svelte/internal/server';
import { Box, Divider } from '@svelteuidev/core';

const code = `
  <script>
    import { Box, Divider } from '@svelteuidev/core';
  <\/script>

  <Box css={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
    <Divider orientation='vertical' \/>
  <\/Box>
`;

export const type = 'demo';
export const configuration = { code };

export default function Divider_demo_vertical($$renderer) {
	Box($$renderer, {
		css: { height: '200px', display: 'flex', justifyContent: 'center' },
		children: ($$renderer) => {
			Divider($$renderer, { size: 'sm', orientation: 'vertical' });
		},
		$$slots: { default: true }
	});
}