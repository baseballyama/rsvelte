import * as $ from 'svelte/internal/server';
import "../app.postcss";
import ModeWatcher from "$lib/components/mode-watcher.svelte";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	ModeWatcher($$renderer, {
		themeColors: { dark: "black", light: "white" },
		disableTransitions: true
	});

	$$renderer.push(`<!----> `);
	children($$renderer);
	$$renderer.push(`<!---->`);
}