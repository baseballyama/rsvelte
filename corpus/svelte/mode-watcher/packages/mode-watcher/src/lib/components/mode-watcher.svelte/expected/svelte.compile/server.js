import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import ModeWatcherLite from "./mode-watcher-lite.svelte";
import ModeWatcherFull from "./mode-watcher-full.svelte";
import { modeStorageKey, themeStorageKey } from "$lib/storage-keys.svelte.js";

import {
	darkClassNames,
	disableTransitions,
	lightClassNames,
	mode,
	synchronousModeChanges,
	theme,
	themeColors
} from "$lib/states.svelte.js";

import { isValidMode } from "$lib/modes.js";
import { defineConfig, setMode, setTheme } from "$lib/mode.js";
import { systemPrefersMode } from "$lib/mode-states.svelte.js";

export default function Mode_watcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			track = true,
			defaultMode = "system",
			themeColors: themeColorsProp,
			disableTransitions: disableTransitionsProp = true,
			darkClassNames: darkClassNamesProp = ["dark"],
			lightClassNames: lightClassNamesProp = [],
			defaultTheme = "",
			nonce = "",
			themeStorageKey: themeStorageKeyProp = "mode-watcher-theme",
			modeStorageKey: modeStorageKeyProp = "mode-watcher-mode",
			disableHeadScriptInjection = false,
			synchronousModeChanges: synchronousModeChangesProp = false
		} = $$props;

		modeStorageKey.current = modeStorageKeyProp;
		themeStorageKey.current = themeStorageKeyProp;
		darkClassNames.current = darkClassNamesProp;
		lightClassNames.current = lightClassNamesProp;
		disableTransitions.current = disableTransitionsProp;
		themeColors.current = themeColorsProp;
		synchronousModeChanges.current = synchronousModeChangesProp;

		onMount(() => {
			systemPrefersMode.tracking(track);
			systemPrefersMode.query();

			const localStorageMode = localStorage.getItem(modeStorageKey.current);

			setMode(isValidMode(localStorageMode) ? localStorageMode : defaultMode);

			const localStorageTheme = localStorage.getItem(themeStorageKey.current);

			setTheme(localStorageTheme || defaultTheme);
		});

		const initConfig = defineConfig({
			defaultMode,
			themeColors: themeColorsProp,
			darkClassNames: darkClassNamesProp,
			lightClassNames: lightClassNamesProp,
			defaultTheme,
			modeStorageKey: modeStorageKeyProp,
			themeStorageKey: themeStorageKeyProp
		});

		const trueNonce = $.derived(() => typeof window === "undefined" ? nonce : "");

		if (disableHeadScriptInjection) {
			$$renderer.push('<!--[0-->');
			ModeWatcherLite($$renderer, { themeColors: themeColors.current });
		} else {
			$$renderer.push('<!--[-1-->');

			ModeWatcherFull($$renderer, {
				trueNonce: trueNonce(),
				initConfig,
				themeColors: themeColors.current
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}