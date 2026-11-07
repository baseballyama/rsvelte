import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`One of elements has focus: <!>`, 1);
var root_1 = $.from_html(`<div><!> <!> <!></div>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const $focused = () => $.store_get(focused, '$focused', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const [focused, ref] = useFocusWithin();
	const theme = useSvelteUITheme();
	const blue = theme.colors.blue50.value;
	const style = 'padding:1rem;border-radius:8px';
	var div = root_1();
	let styles;
	var node = $.child(div);

	Text(node, {
		root: 'p',
		align: 'center',
		size: 'md',
		weight: 'bold',
		tracking: 'tight',
		mb: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var node_1 = $.sibling($.first_child(fragment));

			Text(node_1, {
				root: 'span',
				inherit: true,
				variant: 'gradient',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(($0) => $.set_text(text, $0), [() => upperFirst($focused().toString())]);
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	TextInput(node_2, {
		label: 'Focus this input',
		placeholder: 'Styles will be added to parent'
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		override: { mt: '$5' },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Click Me');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.action(div, ($$node) => ref?.($$node));
	$.template_effect(() => styles = $.set_style(div, style, styles, { 'background-color': $focused() ? blue : 'transparent' }));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}