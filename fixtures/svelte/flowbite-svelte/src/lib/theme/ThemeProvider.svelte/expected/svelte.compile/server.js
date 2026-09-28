import * as $ from 'svelte/internal/server';
import { setThemeContext } from "$lib/context";

export default function ThemeProvider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, theme } = $$props;

		// Create a stable object with a reactive getter that will be tracked
		// when accessed inside $derived expressions in child components
		const themeContext = {
			get value() {
				// This getter makes the theme reactive - when accessed in a $derived,
				// it will track the theme prop and update when it changes
				return theme;
			}
		};

		// Set the context once with the stable object
		setThemeContext(themeContext);

		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}