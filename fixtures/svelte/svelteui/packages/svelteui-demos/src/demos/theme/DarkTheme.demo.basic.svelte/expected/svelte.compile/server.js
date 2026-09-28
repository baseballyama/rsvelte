import * as $ from 'svelte/internal/server';
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

export default function DarkTheme_demo_basic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function toggleTheme() {
			colorScheme.update((v) => v === 'light' ? 'dark' : 'light');
		}

		Stack($$renderer, {
			align: 'center',
			children: ($$renderer) => {
				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Press to change the theme`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);
				Switch($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}