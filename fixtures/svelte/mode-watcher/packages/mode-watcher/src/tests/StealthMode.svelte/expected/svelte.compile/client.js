import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher, resetMode, setMode, toggleMode } from "$lib/index.js";

var root = $.from_html(`<!> <button data-testid="toggle">toggle</button> <button data-testid="light">light</button> <button data-testid="dark">dark</button> <button data-testid="reset">reset</button>`, 1);

export default function StealthMode($$anchor, $$props) {
	$.push($$props, true);

	let track = $.prop($$props, 'track', 3, true);
	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {
		get track() {
			return track();
		},
		themeColors: { dark: "black", light: "white" }
	});

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.delegated('click', button, function (...$$args) {
		toggleMode?.apply(this, $$args);
	});

	$.delegated('click', button_1, () => setMode("light"));
	$.delegated('click', button_2, () => setMode("dark"));
	$.delegated('click', button_3, () => resetMode());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);