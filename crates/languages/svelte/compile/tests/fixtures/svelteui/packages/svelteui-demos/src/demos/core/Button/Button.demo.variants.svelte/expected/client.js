import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Group } from '@svelteuidev/core';

const code = `
	<script>
		import { Button } from '@svelteuidev/core';
	<\/script>
	
	<Button variant="filled">filled</Button>
	<Button variant="light">light</Button>
	<Button variant="outline">outline</Button>
	<Button variant="default">default</Button>
	<Button variant="subtle">subtle</Button>
	`;

export const type = 'demo';
export const configuration = { code, toggle: true };

let variants = ['filled', 'light', 'outline', 'default', 'subtle'];

export default function Button_demo_variants($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => variants, $.index, ($$anchor, variant) => {
				Button($$anchor, {
					get variant() {
						return $.get(variant);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $.get(variant)));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}