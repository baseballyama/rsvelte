import * as $ from 'svelte/internal/server';
import { ModeWatcher, resetMode, setMode, toggleMode } from "$lib/index.js";

export default function StealthMode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { track = true } = $$props;

		ModeWatcher($$renderer, { track, themeColors: { dark: "black", light: "white" } });
		$$renderer.push(`<!----> <button data-testid="toggle">toggle</button> <button data-testid="light">light</button> <button data-testid="dark">dark</button> <button data-testid="reset">reset</button>`);
	});
}