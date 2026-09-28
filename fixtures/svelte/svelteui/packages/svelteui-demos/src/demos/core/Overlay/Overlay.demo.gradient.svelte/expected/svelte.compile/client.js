import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Button, Overlay } from '@svelteuidev/core';

const code = `<script>
	import { Box, Button, Overlay } from '@svelteuidev/core';
<\/script>

<Box>
    <Button>Under overlay</Button>
    <Overlay gradient={'linear-gradient(105deg, black 20%, #312f2f 50%, $gray400 100%)''} />
</Box>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Overlay_demo_gradient($$anchor) {
	Box($$anchor, {
		css: {
			position: 'relative',
			height: 200,
			width: '100%',
			maxWidth: 400,
			marginLeft: 'auto',
			marginRight: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Under overlay');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Overlay(node_1, {
				gradient: `linear-gradient(105deg, black 20%, #312f2f 50%, $gray400 100%)`
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}