import * as $ from 'svelte/internal/server';
import { ObserverRender, Text, Paper } from '@svelteuidev/core';

const code = `
<script>
	import { ObserverRender, Text, Paper } from '@svelteuidev/core';
<\/script>

<Paper>
  <ObserverRender let:visible options={{ threshold: 1 }}>
    <Paper
        padding="xl"
        override={{
          bc: visible ? '$green900' : '$red900', minW: '50%'
        }}
    >
      <Text weight="extrabold">
        {visible ? 'Fully visible' : 'Obscured'}
      </Text>
    </Paper>
  </ObserverRender>
</Paper>
`;

export const type = 'demo';
export const configuration = { code, spacing: false };

export default function ObserverRender_demo_usage($$renderer) {
	Paper($$renderer, {
		override: { overflowY: 'scroll', h: 300 },
		children: ($$renderer) => {
			$$renderer.push(`<div style="padding-top: 260px; padding-bottom: 280px;">`);

			ObserverRender($$renderer, {
				options: { threshold: 1 },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { visible }) => {
						Paper($$renderer, {
							override: { bc: visible ? '$green900' : '$red900', minW: '50%' },
							padding: 'xl',
							children: ($$renderer) => {
								Text($$renderer, {
									override: { color: 'white' },
									weight: 'extrabold',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(visible ? 'Fully visible' : 'Obscured')}`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}