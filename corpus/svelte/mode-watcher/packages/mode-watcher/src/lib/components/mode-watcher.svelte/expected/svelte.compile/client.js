import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Mode_watcher($$anchor, $$props) {
	$.push($$props, true);

	let track = $.prop($$props, 'track', 3, true),
		defaultMode = $.prop($$props, 'defaultMode', 3, "system"),
		disableTransitionsProp = $.prop($$props, 'disableTransitions', 3, true),
		darkClassNamesProp = $.prop($$props, 'darkClassNames', 19, () => ["dark"]),
		lightClassNamesProp = $.prop($$props, 'lightClassNames', 19, () => []),
		defaultTheme = $.prop($$props, 'defaultTheme', 3, ""),
		nonce = $.prop($$props, 'nonce', 3, ""),
		themeStorageKeyProp = $.prop($$props, 'themeStorageKey', 3, "mode-watcher-theme"),
		modeStorageKeyProp = $.prop($$props, 'modeStorageKey', 3, "mode-watcher-mode"),
		disableHeadScriptInjection = $.prop($$props, 'disableHeadScriptInjection', 3, false),
		synchronousModeChangesProp = $.prop($$props, 'synchronousModeChanges', 3, false);

	modeStorageKey.current = modeStorageKeyProp();
	themeStorageKey.current = themeStorageKeyProp();
	darkClassNames.current = darkClassNamesProp();
	lightClassNames.current = lightClassNamesProp();
	disableTransitions.current = disableTransitionsProp();
	themeColors.current = $$props.themeColors;
	synchronousModeChanges.current = synchronousModeChangesProp();

	$.user_pre_effect(() => {
		synchronousModeChanges.current = synchronousModeChangesProp();
	});

	$.user_pre_effect(() => {
		disableTransitions.current = disableTransitionsProp();
	});

	$.user_pre_effect(() => {
		themeColors.current = $$props.themeColors;
	});

	$.user_pre_effect(() => {
		darkClassNames.current = darkClassNamesProp();
	});

	$.user_pre_effect(() => {
		lightClassNames.current = lightClassNamesProp();
	});

	$.user_pre_effect(() => {
		modeStorageKey.current = modeStorageKeyProp();
	});

	$.user_pre_effect(() => {
		themeStorageKey.current = themeStorageKeyProp();
	});

	$.user_pre_effect(() => {
		mode.current;
		modeStorageKey.current;
		themeStorageKey.current;
		theme.current;
	});

	onMount(() => {
		systemPrefersMode.tracking(track());
		systemPrefersMode.query();

		const localStorageMode = localStorage.getItem(modeStorageKey.current);

		setMode(isValidMode(localStorageMode) ? localStorageMode : defaultMode());

		const localStorageTheme = localStorage.getItem(themeStorageKey.current);

		setTheme(localStorageTheme || defaultTheme());
	});

	const initConfig = defineConfig({
		defaultMode: defaultMode(),
		themeColors: $$props.themeColors,
		darkClassNames: darkClassNamesProp(),
		lightClassNames: lightClassNamesProp(),
		defaultTheme: defaultTheme(),
		modeStorageKey: modeStorageKeyProp(),
		themeStorageKey: themeStorageKeyProp()
	});

	const trueNonce = $.derived(() => typeof window === "undefined" ? nonce() : "");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ModeWatcherLite($$anchor, {
				get themeColors() {
					return themeColors.current;
				}
			});
		};

		var alternate = ($$anchor) => {
			ModeWatcherFull($$anchor, {
				get trueNonce() {
					return $.get(trueNonce);
				},

				get initConfig() {
					return initConfig;
				},

				get themeColors() {
					return themeColors.current;
				}
			});
		};

		$.if(node, ($$render) => {
			if (disableHeadScriptInjection()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}