import * as $ from 'svelte/internal/server';
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

export default function Text_demo_usage($$renderer) {
	Text($$renderer, {
		size: 'xs',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Extra small text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		size: 'sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		size: 'md',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		size: 'lg',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		size: 'xl',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Extra large text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		weight: 'semibold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Semibold`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		weight: 'bold',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Bold`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		underline: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Underlined`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		variant: 'link',
		root: 'a',
		href: 'https://svelteui.dev',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Link variant`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		color: 'red',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Red text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		color: 'blue',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Blue text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		color: 'gray',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Gray text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		transform: 'uppercase',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Uppercase`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		transform: 'capitalize',
		children: ($$renderer) => {
			$$renderer.push(`<!---->capitalized text`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aligned to center`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Text($$renderer, {
		align: 'right',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Aligned to right`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}