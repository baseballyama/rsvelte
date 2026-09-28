import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
<\/script>

<Button variant='gradient'>Default</Button>
<Button variant='gradient' gradient={{from: 'teal', to: 'green', deg: 105}}>
	Lime Green
</Button>
<Button variant='gradient' gradient={{from: 'teal', to: 'blue', deg: 60}}>
	Teal Blue
</Button>
<Button variant='gradient' gradient={{from: 'orange', to: 'red', deg: 45}}>
	Orange red
</Button>
<Button variant='gradient' gradient={{from: 'grape', to: 'pink', deg: 35}}>
	Grape Pink
</Button>
`;

export const type = 'demo';
export const configuration = { code, toggle: false };

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Button_demo_gradient($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				variant: 'gradient',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				variant: 'gradient',
				gradient: { from: 'teal', to: 'green', deg: 105 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Lime Green');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				variant: 'gradient',
				gradient: { from: 'teal', to: 'blue', deg: 60 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Teal Blue');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				variant: 'gradient',
				gradient: { from: 'orange', to: 'red', deg: 45 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Orange red');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				variant: 'gradient',
				gradient: { from: 'grape', to: 'pink', deg: 35 },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Grape Pink');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}