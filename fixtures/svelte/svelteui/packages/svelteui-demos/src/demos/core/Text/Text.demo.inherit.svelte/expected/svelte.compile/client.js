import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Text, Title } from '@svelteuidev/core';

const code = `<script>
	import { Center, Text, Title } from '@svelteuidev/core';
<\/script>

<Title order={3}>
    Highlight{' '}
    <Text color="blue" inherit component="span">
        something
    </Text>
    in title
</Title>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(` <!> in title`, 1);

export default function Text_demo_inherit($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Title($$anchor, {
				order: 3,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var text = $.first_child(fragment_2);

					text.nodeValue = 'Highlight  ';

					var node = $.sibling(text);

					Text(node, {
						color: 'blue',
						inherit: true,
						root: 'span',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('something');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}