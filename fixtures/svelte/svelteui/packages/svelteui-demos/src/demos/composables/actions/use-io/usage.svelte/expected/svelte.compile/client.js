import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Paper, Text } from '@svelteuidev/core';
import { io } from '@svelteuidev/composables';

const code = `
<script>
	import { Paper, Text } from '@svelteuidev/core';
	import { io } from '@svelteuidev/composables';

	let visible;
	const handleChange = ({ detail }) => (visible = detail.inView);
<\/script>

<Paper override={{ overflowY: 'scroll', h: 300 }}>
	<div style="padding-top: 260px; padding-bottom: 280px;">
		<div use:io={{ threshold: 1 }} on:change={handleChange}>
			<Paper override={{ bc: visible ? '$green900' : '$red900', minW: '50%' }} padding="xl">
				<Text override={{ color: 'white' }} weight="extrabold">
					{visible ? 'Fully visible' : 'Obscured'}
				</Text>
			</Paper>
		</div>
	</div>
</Paper>
`;

export const type = 'demo';
export const configuration = { code, spacing: false };

var root = $.from_html(`<div style="padding-top: 260px; padding-bottom: 280px;"><div><!></div></div>`);

export default function Usage($$anchor) {
	let visible;
	const handleChange = ({ detail }) => visible = detail.inView;

	Paper($$anchor, {
		override: { overflowY: 'scroll', h: 300 },
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			{
				let $0 = $.derived(() => ({ bc: visible ? '$green900' : '$red900', minW: '50%' }));

				Paper(node, {
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

								$.template_effect(() => $.set_text(text, visible ? 'Fully visible' : 'Obscured'));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			$.reset(div_1);
			$.action(div_1, ($$node, $$action_arg) => io?.($$node, $$action_arg), () => ({ threshold: 1 }));
			$.effect(() => $.event('change', div_1, handleChange));
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}