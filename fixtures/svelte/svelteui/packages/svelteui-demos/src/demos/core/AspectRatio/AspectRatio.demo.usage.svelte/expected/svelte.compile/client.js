import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AspectRatio } from '@svelteuidev/core';

const code = `<script>
	import { AspectRatio } from '@svelteuidev/core';
<\/script>

<AspectRatio ratio={3 / 5}>
	<div style="background-color: purple">Aspect Ratio</div>
</AspectRatio>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<div style="background-color: purple">Aspect Ratio</div>`);

export default function AspectRatio_demo_usage($$anchor) {
	AspectRatio($$anchor, {
		ratio: 3 / 5,
		style: 'max-width: 200px',
		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}