import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Center } from '@svelteuidev/core';

const code = `
<script>
  import { Box } from '@svelteuidev/core';

  const demoStyles = {
    size: '200px',
    linearGradient: '19deg, #21D4FD 0%, #B721FF 100%',
    br: '$squared'
  };
<\/script>

<Box css={demoStyles} />
`;

export const type = 'demo';
export const configuration = { code };

export default function ThemeUtilities_demo_basic($$anchor) {
	const demoStyles = {
		size: '200px',
		linearGradient: '19deg, #21D4FD 0%, #B721FF 100%',
		br: '$squared'
	};

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Box($$anchor, {
				get css() {
					return demoStyles;
				}
			});
		},
		$$slots: { default: true }
	});
}