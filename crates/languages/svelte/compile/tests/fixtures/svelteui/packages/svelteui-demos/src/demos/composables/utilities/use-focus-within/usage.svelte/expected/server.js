import * as $ from 'svelte/internal/server';
import { Text, Button, TextInput, useSvelteUITheme } from '@svelteuidev/core';
import { useFocusWithin, upperFirst } from '@svelteuidev/composables';

const code = `
<script>
	import { Text, Button, TextInput } from '@svelteuidev/core';
	import { useFocusWithin } from '@svelteuidev/composables';

	const [focused, ref] = useFocusWithin();
<\/script>

<Box 
	use={[[ref]]} 
	css={{ backgroundColor: $focused ? '$blue50' : 'transparent', padding: '$10' }}
>
	<Text 
		root="p" 
		align="center" 
		size="md" 
		weight="bold" 
		tracking="tight" 
		mb="lg"
	>
		One of elements has focus:
		<Text root="span" inherit variant="gradient">{$focused}</Text>
	</Text>
	<TextInput label="Focus this input" placeholder="Styles will be added to parent" />
	<Button override={{ mt: '$5' }}>Click Me</Button>
</Box>
`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const [focused, ref] = useFocusWithin();
		const theme = useSvelteUITheme();
		const blue = theme.colors.blue50.value;
		const style = 'padding:1rem;border-radius:8px';

		$$renderer.push(`<div${$.attr_style(style, {
			'background-color': $.store_get($$store_subs ??= {}, '$focused', focused) ? blue : 'transparent'
		})}>`);

		Text($$renderer, {
			root: 'p',
			align: 'center',
			size: 'md',
			weight: 'bold',
			tracking: 'tight',
			mb: 'lg',
			children: ($$renderer) => {
				$$renderer.push(`<!---->One of elements has focus: `);

				Text($$renderer, {
					root: 'span',
					inherit: true,
					variant: 'gradient',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(upperFirst($.store_get($$store_subs ??= {}, '$focused', focused).toString()))}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TextInput($$renderer, {
			label: 'Focus this input',
			placeholder: 'Styles will be added to parent'
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			override: { mt: '$5' },
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click Me`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}