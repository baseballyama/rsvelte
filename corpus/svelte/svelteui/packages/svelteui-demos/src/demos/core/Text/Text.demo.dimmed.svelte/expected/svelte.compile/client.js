import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Text } from '@svelteuidev/core';

const code = `<script>
	import { Text } from '@svelteuidev/core';
<\/script>

<Text color='dimmed'>Dimmed text</Text>`;

export const type = 'demo';
export const configuration = { code };

export default function Text_demo_dimmed($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				color: 'dimmed',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Dimmed text');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}