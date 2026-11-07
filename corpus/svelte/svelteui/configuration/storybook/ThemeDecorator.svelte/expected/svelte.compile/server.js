import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { SvelteUIProvider } from '@svelteuidev/core';

export default function ThemeDecorator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let channel;
		let theme = 'light';

		onMount(() => {
			channel = addons.getChannel();
			channel.on(DARK_MODE_EVENT_NAME, setTheme);
		});

		function setTheme(isDark) {
			theme = isDark ? 'dark' : 'light';
		}

		SvelteUIProvider($$renderer, {
			themeObserver: theme,
			withNormalizeCSS: true,
			withGlobalStyles: true,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);
				$.slot($$renderer, $$props, 'default', {}, null);
				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}