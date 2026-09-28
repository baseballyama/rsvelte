import * as $ from 'svelte/internal/server';
import { Button, Center, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';
<\/script>

<Tooltip label="Opened after 500ms" openDelay={500}>
    <Button variant="outline">Delay open - 500ms</Button>
</Tooltip>

<Tooltip label="Closes after 500ms" closeDelay={500}>
    <Button variant="outline">Delay close - 500ms</Button>
</Tooltip>
`;

export const type = 'demo';
export const configuration = { code };

export default function Tooltip_demo_delay($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				override: { marginRight: '10px' },
				label: 'Opened after 500ms',
				openDelay: 500,
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delay open - 500ms`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				label: 'Closes after 500ms',
				closeDelay: 500,
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Delay close - 500ms`);
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