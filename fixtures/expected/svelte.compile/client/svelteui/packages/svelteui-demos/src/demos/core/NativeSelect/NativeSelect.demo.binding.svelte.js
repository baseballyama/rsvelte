import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NativeSelect, Text } from '@svelteuidev/core';

const code = `<script>
    import { NativeSelect, Text } from '@svelteuidev/core';

    let value = 'Svelte';
<\/script>

<NativeSelect
    data={['Svelte', 'React', 'Vue', 'Angular']}
    bind:value
    label="What is the best framework?"
/>
<Text>The best is <Text root="span" inline variant="gradient">{value}</Text></Text>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`The best is <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function NativeSelect_demo_binding($$anchor) {
	let value = 'Svelte';
	var fragment = root_1();
	var node = $.first_child(fragment);

	NativeSelect(node, {
		data: ['Svelte', 'React', 'Vue', 'Angular'],
		override: { select: { padding: 0 } },
		label: 'What is the best framework?',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Text(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_2 = $.sibling($.first_child(fragment_1));

			Text(node_2, {
				root: 'span',
				inline: true,
				variant: 'gradient',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, value));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}