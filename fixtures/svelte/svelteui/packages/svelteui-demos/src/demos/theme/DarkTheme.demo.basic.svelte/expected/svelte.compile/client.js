import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { colorScheme, Stack, Switch, Text } from '@svelteuidev/core';

const code = `
<script>
 	import { colorScheme, SvelteUIProvider, Stack, Switch, Text } from '@svelteuidev/core';

	function toggleTheme() {
		colorScheme.update((v) => (v === 'light' ? 'dark' : 'light'));
	}
<\/script>

<SvelteUIProvider withGlobalStyles themeObserver={$colorScheme}>
    <Stack align='center'>
        <Text>Press to change the theme</Text>
        <Switch on:change={toggleTheme} />
    </Stack>
</SvelteUIProvider>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function DarkTheme_demo_basic($$anchor, $$props) {
	$.push($$props, true);

	function toggleTheme() {
		colorScheme.update((v) => v === 'light' ? 'dark' : 'light');
	}

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Text(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Press to change the theme');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Switch(node_1, { $$events: { change: toggleTheme } });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}