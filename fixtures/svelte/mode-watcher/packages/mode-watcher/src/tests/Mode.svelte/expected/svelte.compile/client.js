import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'track']);
var root = $.from_html(`<!> <span data-testid="mode-storage-key"> </span> <span data-testid="theme-storage-key"> </span> <span data-testid="mode"> </span> <span data-testid="theme"> </span> <button data-testid="toggle">toggle</button> <button data-testid="light">light</button> <button data-testid="dark">dark</button> <button data-testid="reset">reset</button> <button data-testid="theme-dracula">dracula</button> <button data-testid="theme-retro">retro</button> <button data-testid="theme-clear">clear</button>`, 1);

export default function Mode($$anchor, $$props) {
	$.push($$props, true);

	let track = $.prop($$props, 'track', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, $.spread_props(
		{
			get track() {
				return track();
			}
		},
		() => restProps,
		{ themeColors: { dark: "black", light: "white" } }
	));

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);
	var span_2 = $.sibling(span_1, 2);
	var text_2 = $.only_child(span_2, true);
	var span_3 = $.sibling(span_2, 2);
	var text_3 = $.only_child(span_3, true);
	var button = $.sibling(span_3, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var button_6 = $.sibling(button_5, 2);

	$.template_effect(() => {
		$.set_text(text, modeStorageKey.current);
		$.set_text(text_1, themeStorageKey.current);
		$.set_text(text_2, mode.current);
		$.set_text(text_3, theme.current);
	});

	$.delegated('click', button, function (...$$args) {
		toggleMode?.apply(this, $$args);
	});

	$.delegated('click', button_1, () => setMode("light"));
	$.delegated('click', button_2, () => setMode("dark"));
	$.delegated('click', button_3, () => resetMode());
	$.delegated('click', button_4, () => setTheme("dracula"));
	$.delegated('click', button_5, () => setTheme("retro"));
	$.delegated('click', button_6, () => setTheme(""));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);