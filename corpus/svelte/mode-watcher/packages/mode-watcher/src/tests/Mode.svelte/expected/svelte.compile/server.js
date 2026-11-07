import * as $ from 'svelte/internal/server';

import {
	ModeWatcher,
	mode,
	modeStorageKey,
	resetMode,
	setMode,
	setTheme,
	theme,
	themeStorageKey,
	toggleMode
} from "$lib/index.js";

export default function Mode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { track = true, $$slots, $$events, ...restProps } = $$props;

		ModeWatcher($$renderer, $.spread_props([
			{ track },
			restProps,
			{ themeColors: { dark: "black", light: "white" } }
		]));

		$$renderer.push(`<!----> <span data-testid="mode-storage-key">${$.escape(modeStorageKey.current)}</span> <span data-testid="theme-storage-key">${$.escape(themeStorageKey.current)}</span> <span data-testid="mode">${$.escape(mode.current)}</span> <span data-testid="theme">${$.escape(theme.current)}</span> <button data-testid="toggle">toggle</button> <button data-testid="light">light</button> <button data-testid="dark">dark</button> <button data-testid="reset">reset</button> <button data-testid="theme-dracula">dracula</button> <button data-testid="theme-retro">retro</button> <button data-testid="theme-clear">clear</button>`);
	});
}