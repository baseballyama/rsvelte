import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div style="padding-top: 260px; padding-bottom: 280px;"><!></div>`);

export default function ObserverRender_demo_usage($$anchor) {
	Paper($$anchor, {
		override: { overflowY: 'scroll', h: 300 },
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			ObserverRender(node, {
				options: { threshold: 1 },
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const visible = $.derived(() => $$slotProps.visible);

						{
							let $0 = $.derived(() => ({ bc: $.get(visible) ? '$green900' : '$red900', minW: '50%' }));

							Paper($$anchor, {
								get override() {
									return $.get($0);
								},
								padding: 'xl',
								children: ($$anchor, $$slotProps) => {
									Text($$anchor, {
										override: { color: 'white' },
										weight: 'extrabold',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(visible) ? 'Fully visible' : 'Obscured'));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}