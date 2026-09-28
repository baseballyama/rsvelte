import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { SvelteUIProvider } from '@svelteuidev/core';

export default function ThemeDecorator($$anchor, $$props) {
	$.push($$props, true);

	let channel;
	let theme = 'light';

	onMount(() => {
		channel = addons.getChannel();
		channel.on(DARK_MODE_EVENT_NAME, setTheme);
	});

	function setTheme(isDark) {
		theme = isDark ? 'dark' : 'light';
	}

	SvelteUIProvider($$anchor, {
		get themeObserver() {
			return theme;
		},
		withNormalizeCSS: true,
		withGlobalStyles: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.slot(node, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}