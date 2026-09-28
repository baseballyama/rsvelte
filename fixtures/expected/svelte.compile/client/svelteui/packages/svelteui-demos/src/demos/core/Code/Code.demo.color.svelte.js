import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Code, Group } from '@svelteuidev/core';

const code = `<script>
    import { Code } from '@svelteuidev/core';
<\/script>

<Code color="red">This code is red</Code>
<Code color="teal">This code is teal</Code>
<Code color="blue">This code is blue</Code>
`;

export const type = 'demo';
export const configuration = { code };

export default function Code_demo_color($$anchor) {
	Group($$anchor, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => ['red', 'teal', 'blue'], $.index, ($$anchor, color) => {
				Code($$anchor, {
					get color() {
						return color;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, `This code is ${color ?? ''}`));
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