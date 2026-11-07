import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setThemeContext } from "$lib/context";

export default function ThemeProvider($$anchor, $$props) {
	$.push($$props, true);

	// Create a stable object with a reactive getter that will be tracked
	// when accessed inside $derived expressions in child components
	const themeContext = {
		get value() {
			// This getter makes the theme reactive - when accessed in a $derived,
			// it will track the theme prop and update when it changes
			return $$props.theme;
		}
	};

	// Set the context once with the stable object
	setThemeContext(themeContext);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}