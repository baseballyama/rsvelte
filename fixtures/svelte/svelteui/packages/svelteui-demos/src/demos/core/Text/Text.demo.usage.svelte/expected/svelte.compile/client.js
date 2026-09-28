import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text } from '@svelteuidev/core';

const code = `<script>
	import { Text } from '@svelteuidev/core';
<\/script>

<Text size='xs'>Extra small text</Text>
<Text size='sm'>Small text</Text>
<Text size='md'>Default text</Text>
<Text size='lg'>Large text</Text>
<Text size='xl'>Extra large text</Text>
<Text weight={'semibold'}>Semibold</Text>
<Text weight={'bold'}>Bold</Text>
<Text underline>Underlined</Text>
<Text variant='link' root='a' href='https://svelteui.dev'>Link variant</Text>
<Text color='red'>Red text</Text>
<Text color='blue'>Blue text</Text>
<Text color='gray'>Gray text</Text>
<Text transform='uppercase'>Uppercase</Text>
<Text transform='capitalize'>capitalized text</Text>
<Text align='center'>Aligned to center</Text>
<Text align='right'>Aligned to right</Text>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Text_demo_usage($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Text(node, {
		size: 'xs',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Extra small text');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Text(node_1, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Small text');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Text(node_2, {
		size: 'md',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Default text');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Text(node_3, {
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Large text');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Text(node_4, {
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Extra large text');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Text(node_5, {
		weight: 'semibold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Semibold');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Text(node_6, {
		weight: 'bold',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Bold');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Text(node_7, {
		underline: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Underlined');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Text(node_8, {
		variant: 'link',
		root: 'a',
		href: 'https://svelteui.dev',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Link variant');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Text(node_9, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Red text');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Text(node_10, {
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Blue text');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Text(node_11, {
		color: 'gray',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Gray text');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Text(node_12, {
		transform: 'uppercase',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Uppercase');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Text(node_13, {
		transform: 'capitalize',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('capitalized text');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Text(node_14, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Aligned to center');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Text(node_15, {
		align: 'right',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('Aligned to right');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}